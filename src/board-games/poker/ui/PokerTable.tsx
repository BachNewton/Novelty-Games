import React, { useState, useEffect, useRef } from "react";

type Player = {
    id: string;
    name: string;
    stack: number;
    folded: boolean;
    seatIndex: number;
    connected: boolean;
    betThisRound: number;
    totalBet: number;
};

type GameState = {
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
};

const WS_URL = "ws://localhost:8080"; // ← change to your backend address

export const PokerTable: React.FC = () => {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [joined, setJoined] = useState(false);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [state, setState] = useState<GameState | null>(null);
    const [messageLog, setMessageLog] = useState<string[]>([]);
    const [raiseAmount, setRaiseAmount] = useState<number>(50);

    // connect WebSocket
    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            addLog("Connected to poker server");
        };

        ws.onclose = () => {
            setConnected(false);
            addLog("Disconnected");
        };

        ws.onerror = (err) => {
            console.error(err);
            addLog("WebSocket error");
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            handleServerMessage(msg);
        };

        return () => ws.close();
    }, []);

    const addLog = (text: string) => {
        setMessageLog((prev) => [...prev.slice(-100), text]);
    };

    const handleServerMessage = (msg: any) => {
        const { type, payload } = msg;
        switch (type) {
            case "welcome":
                addLog("Server ready");
                break;
            case "join_ok":
                setPlayerId(payload.playerId);
                setJoined(true);
                addLog(`Joined seat ${payload.seatIndex}`);
                break;
            case "player_update":
            case "state":
                setState(payload);
                break;
            case "player_action":
                addLog(`${payload.playerId} ${payload.action} ${payload.amount ?? ""}`);
                break;
            case "showdown":
                addLog("Showdown! Winners paid");
                break;
            case "hand_started":
                addLog("New hand started");
                break;
            case "error":
                addLog("⚠️ " + payload);
                break;
            default:
                addLog(`Message: ${type}`);
        }
    };

    const send = (msg: any) => {
        if (wsRef.current && connected) {
            wsRef.current.send(JSON.stringify(msg));
        }
    };

    const joinGame = () => {
        if (!name.trim()) return;
        send({ type: "join", payload: { name } });
    };

    const sendAction = (action: string, amount?: number) => {
        if (!playerId) return;
        send({ type: "action", payload: { playerId, action, amount } });
    };

    const you = state?.seats.find((s) => s?.id === playerId) ?? null;
    const isYourTurn =
        state &&
        you &&
        state.seats[state.currentTurnIndex]?.id === you.id &&
        state.handActive;

    return (
        <div className="p-4 max-w-3xl mx-auto space-y-4 text-white bg-green-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-center">♠ Texas Hold’em Table</h1>

            {!joined ? (
                <div className="flex space-x-2 justify-center">
                    <input
                        className="px-2 py-1 rounded text-black"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button
                        onClick={joinGame}
                        disabled={!connected}
                        className="bg-yellow-500 hover:bg-yellow-600 px-4 py-1 rounded"
                    >
                        Join Game
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-center">
                        <div>
                            <strong>Stage:</strong> {state?.stage ?? "waiting"} |{" "}
                            <strong>Pot:</strong> {state?.pot ?? 0} |{" "}
                            <strong>Blinds:</strong>{" "}
                            {state?.smallBlind}/{state?.bigBlind}
                        </div>
                    </div>

                    <div className="flex justify-center space-x-2 my-3">
                        {state?.community.map((c) => (
                            <div
                                key={c}
                                className="bg-white text-black px-2 py-1 rounded shadow"
                            >
                                {c}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {state?.seats.map((p, i) =>
                            p ? (
                                <div
                                    key={p.id}
                                    className={`p-2 rounded border ${state.currentTurnIndex === i
                                            ? "border-yellow-400"
                                            : "border-gray-500"
                                        } ${p.folded ? "opacity-50" : ""}`}
                                >
                                    <div className="font-semibold">
                                        {p.name}{" "}
                                        {you?.id === p.id && (
                                            <span className="text-yellow-300">(You)</span>
                                        )}
                                    </div>
                                    <div>Stack: {p.stack}</div>
                                    <div>Bet: {p.betThisRound}</div>
                                </div>
                            ) : (
                                <div
                                    key={i}
                                    className="p-2 rounded border border-gray-600 text-gray-400 text-sm text-center"
                                >
                                    empty seat
                                </div>
                            )
                        )}
                    </div>

                    {isYourTurn && (
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <button
                                onClick={() => sendAction("fold")}
                                className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded"
                            >
                                Fold
                            </button>
                            <button
                                onClick={() => sendAction("check")}
                                className="bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded"
                            >
                                Check
                            </button>
                            <button
                                onClick={() => sendAction("call")}
                                className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded"
                            >
                                Call
                            </button>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    value={raiseAmount}
                                    onChange={(e) => setRaiseAmount(Number(e.target.value))}
                                    className="w-20 text-black px-1 py-0.5 rounded"
                                />
                                <button
                                    onClick={() => sendAction("raise", raiseAmount)}
                                    className="bg-yellow-500 hover:bg-yellow-600 px-4 py-1 rounded"
                                >
                                    Raise
                                </button>
                            </div>
                            <button
                                onClick={() => sendAction("allin")}
                                className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded"
                            >
                                All-in
                            </button>
                        </div>
                    )}

                    <div className="bg-gray-900 p-2 rounded text-sm max-h-48 overflow-y-auto mt-4">
                        {messageLog.map((m, i) => (
                            <div key={i}>{m}</div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
