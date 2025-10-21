// server.js
//
// Single-table Texas Hold'em WebSocket server (in-memory).
// Install: npm install
// Start:  npm start
//
// Protocol: JSON messages over WebSocket. See "Client message examples" below.

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
    for (const r of RANKS) for (const s of SUITS) d.push(r + s);
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
    seats: Array(MAX_SEATS).fill(null), // each seat: {id, name, ws, stack, seatIndex, active(true/false), folded, betThisRound, totalBet, connected}
    deck: [],
    community: [],
    stage: 'waiting', // waiting, preflop, flop, turn, river, showdown
    dealerIndex: -1,
    currentTurnIndex: -1,
    currentBet: 0, // amount to call this round
    minRaise: BIG_BLIND,
    pot: 0,
    bets: {}, // seatId -> current total contributed in hand (for sidepot calc)
    handActive: false,
};

/* ---------- Utilities ---------- */
function broadcast(type, payload) {
    const msg = JSON.stringify({ type, payload });
    for (const seat of game.seats) {
        if (seat && seat.ws && seat.connected) {
            try { seat.ws.send(msg); } catch (e) { }
        }
    }
}

function seatById(id) {
    return game.seats.find(s => s && s.id === id) || null;
}
function nextSeatIndex(fromIndex) {
    for (let i = 1; i <= MAX_SEATS; i++) {
        const idx = (fromIndex + i) % MAX_SEATS;
        if (game.seats[idx] && game.seats[idx].active && !game.seats[idx].folded) return idx;
    }
    return -1;
}
function activePlayers() {
    return game.seats.filter(s => s && s.active && !s.folded);
}
function activePlayersIncludingAllinNotFolded() {
    return game.seats.filter(s => s && s.active && !s.folded && s.stack >= 0);
}

/* ---------- Seating & connection logic ---------- */
wss.on('connection', function connection(ws) {
    ws.id = uuidv4();
    ws.isAlive = true;

    ws.on('pong', () => ws.isAlive = true);

    ws.on('message', (m) => {
        try {
            const msg = JSON.parse(m.toString());
            handleClientMessage(ws, msg);
        } catch (err) {
            ws.send(JSON.stringify({ type: 'error', payload: 'Invalid JSON' }));
        }
    });

    ws.on('close', () => {
        // mark disconnected but keep seat for a while
        const seat = game.seats.find(s => s && s.ws === ws);
        if (seat) {
            seat.connected = false;
            seat.ws = null;
            broadcast('player_update', publicGameState());
        }
    });

    // send welcome + current table state
    ws.send(JSON.stringify({ type: 'welcome', payload: { serverTime: Date.now(), tableId: game.id } }));
    ws.send(JSON.stringify({ type: 'state', payload: publicGameState() }));
});

/* ping clients and clean dead */
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

/* ---------- Client message handler ---------- */
function handleClientMessage(ws, msg) {
    const { type, payload } = msg;

    if (type === 'join') {
        // payload: { name } -> returns assigned seat info and full state
        const name = payload && payload.name ? String(payload.name).slice(0, 32) : 'Player';
        const seatIndex = game.seats.findIndex(s => s === null);
        if (seatIndex === -1) {
            ws.send(JSON.stringify({ type: 'join_failed', payload: 'Table full' }));
            return;
        }
        const seat = {
            id: uuidv4(),
            name,
            ws,
            stack: STARTING_STACK,
            seatIndex,
            active: true,
            folded: false,
            betThisRound: 0,
            totalBet: 0,
            connected: true,
        };
        game.seats[seatIndex] = seat;
        ws.playerId = seat.id;
        ws.send(JSON.stringify({ type: 'join_ok', payload: { seatIndex, playerId: seat.id } }));
        broadcast('player_update', publicGameState());
        // auto-start if enough players and not already running
        maybeStartHand();
        return;
    }

    if (type === 'leave') {
        // payload: { playerId }
        const pid = payload && payload.playerId ? payload.playerId : ws.playerId;
        if (!pid) { ws.send(JSON.stringify({ type: 'error', payload: 'No player id' })); return; }
        const idx = game.seats.findIndex(s => s && s.id === pid);
        if (idx !== -1) {
            game.seats[idx] = null;
            broadcast('player_update', publicGameState());
        }
        return;
    }

    if (type === 'action') {
        // payload: { playerId, action, amount? }
        const { playerId, action, amount } = payload || {};
        if (!playerId || !action) { ws.send(JSON.stringify({ type: 'error', payload: 'Invalid action payload' })); return; }
        const seat = seatById(playerId);
        if (!seat || !seat.active || seat.folded) { ws.send(JSON.stringify({ type: 'error', payload: 'Invalid player' })); return; }
        if (!game.handActive) { ws.send(JSON.stringify({ type: 'error', payload: 'No active hand' })); return; }
        if (game.seats[game.currentTurnIndex].id !== playerId) { ws.send(JSON.stringify({ type: 'error', payload: 'Not your turn' })); return; }
        processPlayerAction(seat, action, amount);
        return;
    }

    if (type === 'get_state') {
        ws.send(JSON.stringify({ type: 'state', payload: publicGameState() }));
        return;
    }

    ws.send(JSON.stringify({ type: 'error', payload: 'Unknown message type' }));
}

/* ---------- Game flow functions ---------- */

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

function maybeStartHand() {
    if (game.handActive) return;
    const seated = game.seats.filter(s => s && s.active).length;
    if (seated >= MIN_PLAYERS_TO_START) {
        startHand();
    }
}

function startHand() {
    // reset
    game.deck = createDeck();
    game.community = [];
    game.stage = 'preflop';
    game.pot = 0;
    game.bets = {};
    game.handActive = true;

    // rotate dealer
    let nextDealer = game.dealerIndex;
    for (let i = 1; i <= MAX_SEATS; i++) {
        const idx = (game.dealerIndex + i) % MAX_SEATS;
        if (game.seats[idx] && game.seats[idx].active) { nextDealer = idx; break; }
    }
    game.dealerIndex = (nextDealer === -1) ? 0 : nextDealer;

    // reset players
    for (const s of game.seats) {
        if (s) {
            s.folded = false;
            s.betThisRound = 0;
            s.totalBet = 0;
            game.bets[s.id] = 0;
        }
    }

    // deal pocket cards
    for (const s of game.seats) {
        if (s && s.active) {
            s.hole = [game.deck.pop(), game.deck.pop()];
        }
    }

    // post blinds
    const sbIndex = nextOccupiedIndex(game.dealerIndex);
    const bbIndex = nextOccupiedIndex(sbIndex);
    // small blind
    if (sbIndex !== -1) {
        const sb = game.seats[sbIndex];
        const posted = Math.min(SMALL_BLIND, sb.stack);
        sb.stack -= posted;
        sb.betThisRound = posted;
        sb.totalBet += posted;
        game.bets[sb.id] += posted;
        game.pot += posted;
    }
    if (bbIndex !== -1) {
        const bb = game.seats[bbIndex];
        const posted = Math.min(BIG_BLIND, bb.stack);
        bb.stack -= posted;
        bb.betThisRound = posted;
        bb.totalBet += posted;
        game.bets[bb.id] += posted;
        game.pot += posted;
    }
    game.currentBet = Math.max(SMALL_BLIND, BIG_BLIND);
    game.minRaise = BIG_BLIND;

    // determine first to act: first active after BB
    game.currentTurnIndex = nextOccupiedIndex(bbIndex);
    if (game.currentTurnIndex === -1) game.currentTurnIndex = sbIndex; // fallback

    broadcast('hand_started', publicGameState());
    broadcast('info', { text: 'Hand started', dealerIndex: game.dealerIndex });
    broadcast('state', publicGameState());
}

/* find next occupied seat index (active) from given index (inclusive advances forward) */
function nextOccupiedIndex(fromIndex) {
    if (fromIndex === -1) {
        for (let i = 0; i < MAX_SEATS; i++) if (game.seats[i] && game.seats[i].active) return i;
        return -1;
    }
    for (let i = 1; i <= MAX_SEATS; i++) {
        const idx = (fromIndex + i) % MAX_SEATS;
        if (game.seats[idx] && game.seats[idx].active) return idx;
    }
    return -1;
}

/* process a player's action: fold, check, call, raise, allin */
function processPlayerAction(seat, action, amount) {
    action = action.toLowerCase();
    const playerIndex = seat.seatIndex;

    function finishAndAdvance() {
        // if only one player remains (others folded) => award pot and end hand
        const alive = game.seats.filter(s => s && s.active && !s.folded);
        if (alive.length === 1) {
            // award pot to remaining player
            const winner = alive[0];
            const total = collectAllBetsAndClear();
            winner.stack += total;
            broadcast('hand_end', { winner: winner.id, amount: total, state: publicGameState() });
            resetHand();
            setTimeout(() => maybeStartHand(), 1000);
            return;
        }

        // check if betting round is complete: all active players' betThisRound equal (or they are all-in)
        const active = game.seats.filter(s => s && s.active && !s.folded);
        let bettingComplete = true;
        for (const p of active) {
            // players with stack 0 (all-in) can't match more; treat as already satisfied
            if (p.stack > 0 && p.betThisRound !== game.currentBet) { bettingComplete = false; break; }
        }

        if (bettingComplete) {
            // move to next stage or showdown
            if (game.stage === 'preflop') { dealCommunity(3); game.stage = 'flop'; }
            else if (game.stage === 'flop') { dealCommunity(1); game.stage = 'turn'; }
            else if (game.stage === 'turn') { dealCommunity(1); game.stage = 'river'; }
            else if (game.stage === 'river') { game.stage = 'showdown'; doShowdown(); return; }
            // reset per-round bets, set currentTurn to first active after dealer
            for (const p of game.seats) if (p) { p.betThisRound = 0; }
            game.currentBet = 0;
            game.minRaise = BIG_BLIND;
            game.currentTurnIndex = nextOccupiedIndex(game.dealerIndex);
            broadcast('round_end', publicGameState());
            broadcast('state', publicGameState());
            return;
        } else {
            // advance to next active player who is not folded
            const nextIdx = nextSeatIndex(playerIndex);
            if (nextIdx !== -1) {
                game.currentTurnIndex = nextIdx;
            } else {
                // fallback
                game.currentTurnIndex = nextOccupiedIndex(game.dealerIndex);
            }
            broadcast('state', publicGameState());
        }
    }

    // action handlers
    if (action === 'fold') {
        seat.folded = true;
        broadcast('player_action', { playerId: seat.id, action: 'fold' });
        finishAndAdvance();
        return;
    }

    if (action === 'check') {
        if (seat.betThisRound === game.currentBet) {
            broadcast('player_action', { playerId: seat.id, action: 'check' });
            finishAndAdvance();
            return;
        } else {
            // invalid
            seat.ws && seat.ws.send(JSON.stringify({ type: 'error', payload: 'Cannot check, must call or fold' }));
            return;
        }
    }

    if (action === 'call') {
        const amountToCall = game.currentBet - seat.betThisRound;
        const toPay = Math.min(amountToCall, seat.stack);
        seat.stack -= toPay;
        seat.betThisRound += toPay;
        seat.totalBet += toPay;
        game.pot += toPay;
        game.bets[seat.id] += toPay;
        broadcast('player_action', { playerId: seat.id, action: 'call', amount: toPay });
        // if player had 0 stack after paying -> all-in (note: they still have betThisRound possibly < currentBet)
        finishAndAdvance();
        return;
    }

    if (action === 'raise') {
        const raiseAmount = Number(amount) || 0;
        if (raiseAmount <= 0) {
            seat.ws && seat.ws.send(JSON.stringify({ type: 'error', payload: 'Invalid raise amount' }));
            return;
        }
        const toCall = game.currentBet - seat.betThisRound;
        const totalNeeded = toCall + raiseAmount;
        if (totalNeeded > seat.stack) {
            seat.ws && seat.ws.send(JSON.stringify({ type: 'error', payload: 'Not enough chips to raise that amount (use allin)' }));
            return;
        }
        if (raiseAmount < game.minRaise) {
            seat.ws && seat.ws.send(JSON.stringify({ type: 'error', payload: `Raise must be at least minRaise ${game.minRaise}` }));
            return;
        }
        // perform raise
        seat.stack -= totalNeeded;
        seat.betThisRound += totalNeeded;
        seat.totalBet += totalNeeded;
        game.pot += totalNeeded;
        game.bets[seat.id] += totalNeeded;
        game.currentBet = seat.betThisRound;
        game.minRaise = Math.max(game.minRaise, raiseAmount);
        // next player is the next active after raiser
        game.currentTurnIndex = nextSeatIndex(seat.seatIndex);
        broadcast('player_action', { playerId: seat.id, action: 'raise', amount: raiseAmount });
        broadcast('state', publicGameState());
        return;
    }

    if (action === 'allin') {
        const toPut = seat.stack;
        if (toPut <= 0) {
            seat.ws && seat.ws.send(JSON.stringify({ type: 'error', payload: 'No chips to go all-in' }));
            return;
        }
        seat.stack = 0;
        seat.betThisRound += toPut;
        seat.totalBet += toPut;
        game.pot += toPut;
        game.bets[seat.id] += toPut;
        if (seat.betThisRound > game.currentBet) {
            game.minRaise = Math.max(game.minRaise, seat.betThisRound - game.currentBet);
            game.currentBet = seat.betThisRound;
        }
        broadcast('player_action', { playerId: seat.id, action: 'allin', amount: toPut });
        finishAndAdvance();
        return;
    }

    // invalid action
    seat.ws && seat.ws.send(JSON.stringify({ type: 'error', payload: 'Unknown action' }));
}

/* collect all bets into pot and reset */
function collectAllBetsAndClear() {
    let total = 0;
    for (const s of game.seats) {
        if (s) {
            total += (s.totalBet || 0);
            s.totalBet = 0;
            s.betThisRound = 0;
        }
    }
    game.bets = {};
    game.pot = 0;
    return total;
}

/* deal n community cards (burn not simulated) */
function dealCommunity(n) {
    for (let i = 0; i < n; i++) {
        const c = game.deck.pop();
        if (c) game.community.push(c);
    }
    // after dealing, reset players' betThisRound to 0 but keep totalBet for pot accounting until showdown/collectAllBets
    for (const s of game.seats) if (s) s.betThisRound = 0;
    game.currentBet = 0;
    // set current turn to first active after dealer
    game.currentTurnIndex = nextOccupiedIndex(game.dealerIndex);
    broadcast('deal', { community: game.community.slice(), stage: game.stage });
    broadcast('state', publicGameState());
}

/* showdown with side-pot handling and distribution */
function doShowdown() {
    // convert contributions map from totalBet across hand per player
    const contributions = {};
    for (const s of game.seats) {
        if (s && (s.totalBet > 0 || s.active)) {
            contributions[s.id] = s.totalBet || 0;
        }
    }
    // include any players who have contributed if their totalBet is 0 but they are active (possible if no bets)
    for (const s of game.seats) {
        if (s && s.active && !(s.id in contributions)) contributions[s.id] = 0;
    }

    // build pots: handle side-pots by unique contribution levels
    const playersInHand = game.seats.filter(s => s && s.active);
    const uniqueContribs = Array.from(new Set(Object.values(contributions))).sort((a, b) => a - b);
    const pots = []; // { amount, eligible: [seatIds] }
    let prev = 0;
    for (const level of uniqueContribs) {
        if (level === prev) continue;
        const involved = Object.entries(contributions)
            .filter(([pid, c]) => c >= level)
            .map(([pid]) => pid);
        const count = involved.length;
        const potAmount = (level - prev) * count;
        if (potAmount > 0) pots.push({ amount: potAmount, eligible: involved.slice() });
        prev = level;
    }

    // if there is leftover in game.pot (should be sum of contributions), ensure accounted
    const sumPots = pots.reduce((s, p) => s + p.amount, 0);
    const totalContrib = Object.values(contributions).reduce((s, v) => s + v, 0);
    if (sumPots < totalContrib) {
        pots.push({ amount: totalContrib - sumPots, eligible: Object.keys(contributions) });
    }

    // For each pot, evaluate eligible players' best hands
    const potWinners = [];
    for (const pot of pots) {
        const evals = [];
        for (const pid of pot.eligible) {
            const seat = game.seats.find(s => s && s.id === pid);
            if (!seat) continue;
            // skip folded players
            if (seat.folded) continue;
            const cards = (seat.hole || []).concat(game.community || []);
            // poker-evaluator expects 7 or less card strings like 'As'
            const res = PokerEvaluator.evalHand(cards);
            evals.push({ pid, value: res.value, handName: res.handName });
        }
        if (evals.length === 0) continue; // nobody eligible? skip
        // find best value (higher is better)
        let best = evals[0];
        for (const e of evals) if (e.value > best.value) best = e;
        // check ties
        const tied = evals.filter(e => e.value === best.value).map(e => e.pid);
        potWinners.push({ potAmount: pot.amount, winners: tied });
    }

    // allocate pot amounts (split equally among tied winners)
    const awards = {};
    for (const p of potWinners) {
        const share = Math.floor(p.potAmount / p.winners.length);
        for (const pid of p.winners) {
            awards[pid] = (awards[pid] || 0) + share;
        }
    }

    // give awards to stacks
    for (const [pid, amt] of Object.entries(awards)) {
        const seat = game.seats.find(s => s && s.id === pid);
        if (seat) seat.stack += amt;
    }

    // notify clients
    broadcast('showdown', { community: game.community.slice(), awards, pots: potWinners, state: publicGameState() });

    // clear and prepare for next hand
    for (const s of game.seats) if (s) {
        s.hole = null;
        s.totalBet = 0;
        s.betThisRound = 0;
    }
    game.pot = 0;
    game.handActive = false;
    // small pause then start next hand if still enough players
    setTimeout(() => { resetHand(); maybeStartHand(); }, 1000);
}

function resetHand() {
    game.deck = [];
    game.community = [];
    game.stage = 'waiting';
    game.currentTurnIndex = -1;
    game.currentBet = 0;
    game.minRaise = BIG_BLIND;
    game.bets = {};
    game.handActive = false;
    // remove players with no chips? keep them but marked inactive
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
        res.end(JSON.stringify({ status: 'ok', tableId: game.id }));
    } else {
        res.writeHead(204);
        res.end();
    }
}).listen(8081);

/* ---------- End of server ---------- */
