import React, { useEffect, useRef, useState } from 'react';

interface Player {
    id: string;
    name: string;
    stack: number;
    folded: boolean;
    seatIndex: number;
    connected: boolean;
    betThisRound: number;
    totalBet: number;
}

interface GameState {
    seats: (Player | null)[];
    community: string[];
    stage: string;
    dealerIndex: number;
    currentTurnIndex: number;
    currentBet: number;
    pot: number;
    handActive: boolean;
    smallBlind: number;
    bigBlind: number;
}

const WS_URL = process.env.REACT_APP_POKER_WS || 'ws://localhost:8080';

const PokerTable: React.FC = () => {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [joined, setJoined] = useState(false);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [seatIndex, setSeatIndex] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [state, setState] = useState<GameState | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [raiseAmount, setRaiseAmount] = useState<number>(50);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            addLog('Connected to poker server');
        };

        ws.onclose = () => {
            setConnected(false);
            addLog('Disconnected from server');
        };

        ws.onerror = (err) => {
            console.error('ws error', err);
            addLog('WebSocket error');
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                handleMessage(msg);
            } catch (err) {
                console.error('msg parse', err);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const addLog = (t: string) => setLogs((s) => [...s.slice(-200), t]);

    const handleMessage = (msg: any) => {
        const { type, payload } = msg;
        switch (type) {
            case 'welcome':
                addLog('Server welcomed us');
                break;
            case 'state':
            case 'player_update':
                setState(payload as GameState);
                break;
            case 'join_ok':
                setPlayerId(payload.playerId);
                setSeatIndex(payload.seatIndex);
                setJoined(true);
                addLog(`Joined seat ${payload.seatIndex}`);
                break;
            case 'player_action':
                addLog(`${payload.playerId} ${payload.action} ${payload.amount ?? ''}`);
                break;
            case 'hand_started':
                addLog('Hand started');
                setState(payload as GameState);
                break;
            case 'deal':
                setState((prev) => ({ ...(prev as any), community: payload.community, stage: payload.stage }));
                break;
            case 'showdown':
                addLog('Showdown: ' + JSON.stringify(payload.awards || payload));
                setState(payload.state || null);
                break;
            case 'info':
                addLog(payload.text || JSON.stringify(payload));
                break;
            case 'error':
                addLog('⚠️ ' + payload);
                break;
            default:
                addLog('msg: ' + type);
        }
    };

    const send = (obj: any) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        ws.send(JSON.stringify(obj));
    };

    const joinGame = () => {
        if (!name.trim()) return;
        send({ type: 'join', payload: { name } });
    };

    const sendAction = (action: string, amount?: number) => {
        if (!playerId) return addLog('You must join first');
        send({ type: 'action', payload: { playerId, action, amount } });
    };

    const you = state?.seats.find((s) => s?.id === playerId) ?? null;
    const isYourTurn =
        state &&
        you &&
        state.currentTurnIndex === you.seatIndex &&
        state.handActive;

    return (
        <div style={{ padding: 12, maxWidth: 900, margin: '0 auto', color: '#fff' }}>
            <h2>Texas Hold'em</h2>

            {!joined ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                    <button onClick={joinGame} disabled={!connected}>Join</button>
                </div>
            ) : (
                <div>Joined as <strong>{name}</strong> (id: {playerId})</div>
            )}

            <div style={{ marginTop: 12 }}>
                <div><strong>Stage:</strong> {state?.stage ?? 'waiting'} | <strong>Pot:</strong> {state?.pot ?? 0}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {(state?.community ?? []).map((c) => (
                        <div key={c} style={{ background: '#fff', color: '#000', padding: '4px 8px', borderRadius: 4 }}>{c}</div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 12 }}>
                {state?.seats.map((p, i) => (
                    p ? (
                        <div key={p.id} style={{ padding: 8, border: state.currentTurnIndex === i ? '2px solid yellow' : '1px solid #666', borderRadius: 6, background: p.folded ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)' }}>
                            <div style={{ fontWeight: 600 }}>{p.name} {you?.id === p.id ? '(You)' : ''}</div>
                            <div>Stack: {p.stack}</div>
                            <div>Bet: {p.betThisRound}</div>
                            <div>Seat: {p.seatIndex}</div>
                        </div>
                    ) : (
                        <div key={'e' + i} style={{ padding: 8, border: '1px dashed #444', borderRadius: 6, color: '#888' }}>empty</div>
                    )
                ))}
            </div>

            {isYourTurn && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => sendAction('fold')}>Fold</button>
                    <button onClick={() => sendAction('check')}>Check</button>
                    <button onClick={() => sendAction('call')}>Call</button>
                    <input type="number" value={raiseAmount} onChange={(e) => setRaiseAmount(Number(e.target.value))} style={{ width: 100 }} />
                    <button onClick={() => sendAction('raise', raiseAmount)}>Raise</button>
                    <button onClick={() => sendAction('allin')}>All-in</button>
                </div>
            )}

            <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700 }}>Logs</div>
                <div style={{ maxHeight: 240, overflowY: 'auto', background: '#111', padding: 8, borderRadius: 6 }}>
                    {logs.map((l, i) => <div key={i} style={{ fontSize: 13 }}>{l}</div>)}
                </div>
            </div>
        </div>
    );
};

export default PokerTable;
