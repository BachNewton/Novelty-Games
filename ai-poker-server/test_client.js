// Simple test client to simulate two players connecting to the holdem WS server.
// Run with: node test_client.js

const WebSocket = require('ws');

const URL = process.env.WS_URL || 'ws://localhost:8080';

function createClient(name) {
    return new Promise((resolve) => {
        const ws = new WebSocket(URL);
        const client = { ws, name, playerId: null, seatIndex: null };

        ws.on('open', () => {
            console.log(`${name} connected`);
            ws.send(JSON.stringify({ type: 'join', payload: { name } }));
        });

        ws.on('message', (m) => {
            try {
                const msg = JSON.parse(m.toString());
                console.log(`[${name}] recv:`, msg.type, msg.payload ?? '');
                if (msg.type === 'join_ok') {
                    client.playerId = msg.payload.playerId;
                    client.seatIndex = msg.payload.seatIndex;
                    resolve(client);
                }
            } catch (err) {
                console.error('parse err', err);
            }
        });

        ws.on('close', () => console.log(`${name} closed`));
        ws.on('error', (e) => console.error(`${name} ws error`, e));
    });
}

function sendAction(client, action, amount) {
    if (!client || !client.ws || client.ws.readyState !== WebSocket.OPEN) return;
    client.ws.send(JSON.stringify({ type: 'action', payload: { playerId: client.playerId, action, amount } }));
    console.log(`[${client.name}] sent action: ${action}${amount ? ' ' + amount : ''}`);
}

async function main() {
    console.log('Starting test client (2 players) ->', URL);
    const [a, b] = await Promise.all([createClient('Alice'), createClient('Bob')]);

    // Listen for state updates and act when it's our turn
    a.ws.on('message', (m) => handleMessage(a, m));
    b.ws.on('message', (m) => handleMessage(b, m));

    function handleMessage(client, m) {
        let msg;
        try { msg = JSON.parse(m.toString()); } catch { return; }
        if (msg.type === 'state') {
            const state = msg.payload;
            // if hand active and it's our turn, make a safe action
            if (state.handActive && state.currentTurnIndex === client.seatIndex) {
                const seat = state.seats[client.seatIndex];
                if (!seat) return;
                const toCall = state.currentBet - (seat.betThisRound || 0);
                if (toCall > 0) {
                    sendAction(client, 'call');
                } else {
                    sendAction(client, 'check');
                }
            }
        }

        if (msg.type === 'hand_started') {
            console.log(`[${client.name}] hand started`);
        }

        if (msg.type === 'showdown') {
            console.log('Showdown:', msg.payload.awards);
        }
    }

    // let the clients run for 15 seconds then exit
    setTimeout(() => {
        console.log('Test finished — closing sockets');
        a.ws.close();
        b.ws.close();
        process.exit(0);
    }, 15000);
}

main().catch((e) => { console.error(e); process.exit(1); });
