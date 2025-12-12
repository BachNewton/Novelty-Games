import { useEffect, useRef, useState } from "react";
import { createPokerNetworking } from "../logic/PokerNetworking";
import Lobby from "./Lobby";
import Game from "./Game";
import { GameData } from "../data/GameData";
import { Card } from "../data/Card";

interface HomeProps { }

type State = LobbyState | GameState;

interface LobbyState {
    type: 'lobby';
}

interface GameState {
    type: 'game';
    data: GameData;
}

const DEFAULT_STATE: LobbyState = { type: 'lobby' };

const Home: React.FC<HomeProps> = () => {
    const networking = useRef(createPokerNetworking()).current;
    const hasGameStarted = useRef(false);
    const [state, setState] = useState<State>(DEFAULT_STATE);
    const [username, setUsername] = useState('');
    const [players, setPlayers] = useState<string[]>([]);
    const [isYourTurn, setIsYourTurn] = useState(false);
    const [pot, setPot] = useState(0);
    const [boardCards, setBoardCards] = useState<Card[]>([]);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        networking.onGameBegun(() => {
            hasGameStarted.current = true;
        });

        networking.onRoomUsers(users => {
            setPlayers(users);
        });

        networking.onGameUpdate(data => {
            if (!hasGameStarted.current) return;

            const gameState: GameState = { type: 'game', data: data };
            setState(gameState);
        });

        networking.onYourTurn(() => setIsYourTurn(true));

        networking.onPotUpdate(potSize => setPot(potSize));

        networking.onDealBoard(cards => setBoardCards(cards));

        networking.onMessage(message => setMessages(pre => [message, ...pre]));
    }, []);

    switch (state.type) {
        case 'lobby':
            return <Lobby
                username={username}
                players={players}
                setUsername={setUsername}
                connect={networking.connect}
                startGame={networking.startGame}
            />;
        case 'game':
            return <Game
                data={state.data}
                isYourTurn={isYourTurn}
                actions={{
                    fold: () => networking.takeAction({ type: 'fold' }),
                    check: () => networking.takeAction({ type: 'check' }),
                    call: () => networking.takeAction({ type: 'call' }),
                    raise: (amount) => networking.takeAction({ type: 'raise', amount: amount }),
                    allIn: () => { }
                }}
                pot={pot}
                boardCards={boardCards}
                messages={messages}
            />;
    }
};

export default Home;
