// server.js
//
// Single-table Texas Hold'em WebSocket server (in-memory).
// Install: cd ai-poker-server && npm install
// Start:  cd ai-poker-server && npm start
//
// Protocol: JSON messages over WebSocket. Messages are simple objects { type, payload }.

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const PokerEvaluator = require('poker-evaluator');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`Hold'em WS server listening on ws://localhost:${PORT}`);

/* ---------- Game configuration ---------- */
const MAX_SEATS = 6;
const SMALL_BLIND = 10;
const BIG_BLIND = 20;
const STARTING_STACK = 1000;
const MIN_PLAYERS_TO_START = 2;

/* ---------- Helper: deck/cards ---------- */
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS = ['s', 'h', 'd', 'c']; // poker-evaluator uses these letters
function createDeck() {
    const d = [];
    for (const r of RANKS) {
        for (const s of SUITS) {
            d.push(r + s);
        }
    }
    return shuffle(d);
}
function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

/* ---------- Game state (single table) ---------- */
const game = {
    id: uuidv4(),
    seats: Array(MAX_SEATS).fill(null), // seat: { id, name, ws, stack, seatIndex, active, folded, betThisRound, totalBet, connected, hole }
    deck: [],
    community: [],
    stage: 'waiting', // waiting, preflop, flop, turn, river, showdown
    dealerIndex: -1,
    currentTurnIndex: -1,
    currentBet: 0, // amount to call this round
    minRaise: BIG_BLIND,
    pot: 0,
    handActive: false,
};

/* ---------- Utilities ---------- */
function sendTo(ws, type, payload) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type, payload }));
}

function broadcast(type, payload) {
    const msg = JSON.stringify({ type, payload });
    for (const seat of game.seats) {
        if (seat && seat.ws && seat.connected && seat.ws.readyState === WebSocket.OPEN) {
            seat.ws.send(msg);
        }
    }
}

function seatById(id) {
    return game.seats.find(s => s && s.id === id) || null;
}

function nextIndex(from) {
    for (let i = 1; i <= MAX_SEATS; i++) {
        const idx = (from + i) % MAX_SEATS;
        if (game.seats[idx] && game.seats[idx].active && !game.seats[idx].folded) return idx;
    }
    return -1;
}

function activePlayers() {
    return game.seats.filter(s => s && s.active && !s.folded);
}

/* ---------- Public state for clients ---------- */
function publicGameState() {
    return {
        seats: game.seats.map(s => s ? {
            id: s.id,
            name: s.name,
            stack: s.stack,
            seatIndex: s.seatIndex,
            active: s.active,
            folded: s.folded,
            connected: s.connected,
            betThisRound: s.betThisRound,
            totalBet: s.totalBet,
        } : null),
        community: game.community.slice(),
        stage: game.stage,
        dealerIndex: game.dealerIndex,
        currentTurnIndex: game.currentTurnIndex,
        currentBet: game.currentBet,
        pot: game.pot,
        handActive: game.handActive,
        smallBlind: SMALL_BLIND,
        bigBlind: BIG_BLIND,
    };
}

/* ---------- Connection handling ---------- */
wss.on('connection', function connection(ws) {
    ws.id = uuidv4();
    ws.isAlive = true;

    ws.on('pong', () => ws.isAlive = true);

    ws.on('message', (m) => {
        try {
            const msg = JSON.parse(m);
            handleClientMessage(ws, msg);
        } catch (err) {
            console.error('Invalid message', err);
            sendTo(ws, 'error', 'Invalid message format');
        }
    });

    ws.on('close', () => {
        const seat = game.seats.find(s => s && s.ws === ws);
        if (seat) {
            seat.connected = false;
            seat.ws = null;
            // keep seat reserved for reconnection
            broadcast('player_update', publicGameState());
        }
    });

    // send welcome + current table state
    sendTo(ws, 'welcome', { serverTime: Date.now(), tableId: game.id });
    sendTo(ws, 'state', publicGameState());
});

/* ping clients and clean dead */
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping(() => { });
    });
}, 30000);

/* ---------- Client message handler ---------- */
function handleClientMessage(ws, msg) {
    const { type, payload } = msg;

    if (type === 'join') {
        const name = (payload && payload.name) ? String(payload.name).slice(0, 32) : 'Anon';
        // find existing seat by ws (reconnect) or free seat
        let seat = game.seats.find(s => s && s.ws === ws);
        if (!seat) {
            const freeIndex = game.seats.findIndex(s => !s);
            if (freeIndex === -1) return sendTo(ws, 'error', 'Table is full');
            const id = uuidv4();
            seat = {
                id,
                name,
                ws,
                stack: STARTING_STACK,
                seatIndex: freeIndex,
                active: true,
                folded: false,
                betThisRound: 0,
                totalBet: 0,
                connected: true,
                hole: [],
            };
            game.seats[freeIndex] = seat;
        } else {
            seat.name = name;
            seat.ws = ws;
            seat.connected = true;
        }

        sendTo(ws, 'join_ok', { playerId: seat.id, seatIndex: seat.seatIndex });
        broadcast('player_update', publicGameState());

        maybeStartHand();
        return;
    }

    if (type === 'leave') {
        const playerId = payload && payload.playerId;
        if (!playerId) return sendTo(ws, 'error', 'playerId required');
        const seat = seatById(playerId);
        if (seat) {
            game.seats[seat.seatIndex] = null;
            broadcast('player_update', publicGameState());
        }
        return;
    }

    if (type === 'action') {
        const { playerId, action, amount } = payload || {};
        if (!playerId || !action) return sendTo(ws, 'error', 'playerId and action required');
        const seat = seatById(playerId);
        if (!seat) return sendTo(ws, 'error', 'Invalid player');
        if (!game.handActive) return sendTo(ws, 'error', 'No active hand');
        processPlayerAction(seat, action, amount);
        return;
    }

    if (type === 'get_state') {
        sendTo(ws, 'state', publicGameState());
        return;
    }

    sendTo(ws, 'error', 'Unknown message type');
}

/* ---------- Game flow functions (simplified) ---------- */
function maybeStartHand() {
    if (game.handActive) return;
    const seated = game.seats.filter(s => s && s.active).length;
    if (seated >= MIN_PLAYERS_TO_START) startHand();
}

function startHand() {
    // reset
    game.deck = createDeck();
    game.community = [];
    game.stage = 'preflop';
    game.pot = 0;
    game.handActive = true;

    // rotate dealer
    let nextDealer = game.dealerIndex;
    for (let i = 1; i <= MAX_SEATS; i++) {
        const idx = (nextDealer + i) % MAX_SEATS;
        if (game.seats[idx] && game.seats[idx].active) { nextDealer = idx; break; }
    }
    game.dealerIndex = nextDealer === -1 ? 0 : nextDealer;

    // reset players
    for (const s of game.seats) {
        if (s) {
            s.folded = false;
            s.betThisRound = 0;
            s.totalBet = 0;
            s.hole = [];
        }
    }

    // deal pocket cards
    for (const s of game.seats) {
        if (s && s.active) {
            s.hole = [game.deck.pop(), game.deck.pop()];
        }
    }

    // post blinds
    const sbIndex = nextIndex(game.dealerIndex - 1);
    const bbIndex = nextIndex(sbIndex - 1);
    if (sbIndex !== -1) {
        const sb = game.seats[sbIndex];
        const posted = Math.min(SMALL_BLIND, sb.stack);
        sb.stack -= posted;
        sb.betThisRound = posted;
        sb.totalBet = (sb.totalBet || 0) + posted;
    }
    if (bbIndex !== -1) {
        const bb = game.seats[bbIndex];
        const posted = Math.min(BIG_BLIND, bb.stack);
        bb.stack -= posted;
        bb.betThisRound = posted;
        bb.totalBet = (bb.totalBet || 0) + posted;
    }

    game.currentBet = BIG_BLIND;
    game.minRaise = BIG_BLIND;

    // determine first to act: first active after BB
    game.currentTurnIndex = nextIndex(bbIndex);
    if (game.currentTurnIndex === -1) game.currentTurnIndex = game.dealerIndex;

    broadcast('hand_started', publicGameState());
    broadcast('info', { text: 'Hand started', dealerIndex: game.dealerIndex });
    broadcast('state', publicGameState());
}

function bettingRoundComplete() {
    const active = game.seats.filter(s => s && s.active && !s.folded);
    if (active.length <= 1) return true;
    // all active players either matched currentBet or are all-in
    for (const s of active) {
        if ((s.betThisRound || 0) < game.currentBet && s.stack > 0) return false;
    }
    return true;
}

function processPlayerAction(seat, action, amount) {
    action = String(action).toLowerCase();
    const idx = seat.seatIndex;

    function endBettingRound() {
        // collect bets into pot
        for (const s of game.seats) {
            if (s) { game.pot += (s.betThisRound || 0); s.betThisRound = 0; }
        }
        game.currentBet = 0;
        // move stage
        if (game.stage === 'preflop') {
            game.stage = 'flop';
            dealCommunity(3);
        } else if (game.stage === 'flop') {
            game.stage = 'turn';
            dealCommunity(1);
        } else if (game.stage === 'turn') {
            game.stage = 'river';
            dealCommunity(1);
        } else if (game.stage === 'river') {
            game.stage = 'showdown';
            doShowdown();
        }
    }

    if (!seat || !seat.active || seat.folded) return sendTo(seat.ws, 'error', 'Cannot act');

    if (action === 'fold') {
        seat.folded = true;
        broadcast('player_action', { playerId: seat.id, action: 'fold' });
        // if only one left, immediate showdown
        const remaining = game.seats.filter(s => s && s.active && !s.folded);
        if (remaining.length <= 1) {
            doShowdown();
            return;
        }
        game.currentTurnIndex = nextIndex(idx);
        if (bettingRoundComplete()) endBettingRound();
        broadcast('state', publicGameState());
        return;
    }

    if (action === 'check') {
        if ((seat.betThisRound || 0) < game.currentBet) return sendTo(seat.ws, 'error', 'Cannot check, must call or fold');
        broadcast('player_action', { playerId: seat.id, action: 'check' });
        game.currentTurnIndex = nextIndex(idx);
        if (bettingRoundComplete()) endBettingRound();
        broadcast('state', publicGameState());
        return;
    }

    if (action === 'call') {
        const toCall = game.currentBet - (seat.betThisRound || 0);
        const posted = Math.min(toCall, seat.stack);
        seat.stack -= posted;
        seat.betThisRound = (seat.betThisRound || 0) + posted;
        seat.totalBet = (seat.totalBet || 0) + posted;
        broadcast('player_action', { playerId: seat.id, action: 'call', amount: posted });
        game.currentTurnIndex = nextIndex(idx);
        if (bettingRoundComplete()) endBettingRound();
        broadcast('state', publicGameState());
        return;
    }

    if (action === 'raise') {
        const amt = Number(amount) || 0;
        if (amt <= 0) return sendTo(seat.ws, 'error', 'Invalid raise amount');
        const toCall = game.currentBet - (seat.betThisRound || 0);
        const totalNeeded = toCall + amt;
        if (totalNeeded > seat.stack) return sendTo(seat.ws, 'error', 'Not enough chips to raise that amount');
        // apply
        seat.stack -= totalNeeded;
        seat.betThisRound = (seat.betThisRound || 0) + totalNeeded;
        seat.totalBet = (seat.totalBet || 0) + totalNeeded;
        game.currentBet = seat.betThisRound;
        game.minRaise = Math.max(game.minRaise, amt);
        broadcast('player_action', { playerId: seat.id, action: 'raise', amount: totalNeeded });
        game.currentTurnIndex = nextIndex(idx);
        // continue betting until everyone matches
        broadcast('state', publicGameState());
        return;
    }

    if (action === 'allin') {
        const allinAmt = seat.stack;
        seat.betThisRound = (seat.betThisRound || 0) + allinAmt;
        seat.totalBet = (seat.totalBet || 0) + allinAmt;
        seat.stack = 0;
        if (seat.betThisRound > game.currentBet) {
            game.minRaise = Math.max(game.minRaise, seat.betThisRound - game.currentBet);
            game.currentBet = seat.betThisRound;
        }
        broadcast('player_action', { playerId: seat.id, action: 'allin', amount: allinAmt });
        game.currentTurnIndex = nextIndex(idx);
        if (bettingRoundComplete()) endBettingRound();
        broadcast('state', publicGameState());
        return;
    }

    sendTo(seat.ws, 'error', 'Unknown action');
}

function dealCommunity(n) {
    for (let i = 0; i < n; i++) {
        const c = game.deck.pop();
        if (c) game.community.push(c);
    }
    // after dealing, reset bets for new betting round
    for (const s of game.seats) {
        if (s) s.betThisRound = 0;
    }
    game.currentBet = 0;
    game.currentTurnIndex = nextIndex(game.dealerIndex);
    broadcast('deal', { community: game.community.slice(), stage: game.stage });
    broadcast('state', publicGameState());
}

function doShowdown() {
    // collect any leftover bets into pot
    for (const s of game.seats) {
        if (s) { game.pot += (s.betThisRound || 0); s.betThisRound = 0; }
    }

    // determine winners (simple, no sidepot handling)
    const contenders = game.seats.filter(s => s && s.active && !s.folded && (s.hole && s.hole.length === 2));
    if (contenders.length === 0) {
        // nothing to do
        resetHand();
        return;
    }

    let bestVal = -Infinity;
    const winners = [];
    for (const s of contenders) {
        const evalRes = PokerEvaluator.evalHand([...s.hole, ...game.community]);
        if (evalRes.value > bestVal) {
            bestVal = evalRes.value;
            winners.length = 0;
            winners.push({ seat: s, eval: evalRes });
        } else if (evalRes.value === bestVal) {
            winners.push({ seat: s, eval: evalRes });
        }
    }

    // split pot
    const share = Math.floor(game.pot / winners.length);
    for (const w of winners) {
        w.seat.stack += share;
    }

    const awards = {};
    for (const w of winners) awards[w.seat.id] = share;

    broadcast('showdown', { community: game.community.slice(), awards, winners: winners.map(w => ({ id: w.seat.id, name: w.seat.name, hand: w.eval.handName })), state: publicGameState() });

    // clean up and prepare next hand
    resetHand();
    setTimeout(() => maybeStartHand(), 1000);
}

function resetHand() {
    game.deck = [];
    game.community = [];
    game.stage = 'waiting';
    game.currentTurnIndex = -1;
    game.currentBet = 0;
    game.minRaise = BIG_BLIND;
    game.handActive = false;
    game.pot = 0;
    // remove players with no chips? keep them but mark inactive
    for (let i = 0; i < game.seats.length; i++) {
        const s = game.seats[i];
        if (s && s.stack <= 0) {
            s.active = false;
        }
    }
    broadcast('state', publicGameState());
}

/* ---------- Expose simple HTTP for health check (optional) ---------- */
const http = require('http');
http.createServer((req, res) => {
    if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, tableId: game.id }));
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(8081);

/* ---------- End of server ---------- */
