import { useEffect, useRef, useState } from "react";
import { LabyrinthCommunicator } from "../logic/LabyrinthCommunicator";
import { getProfile, Profile } from "../../../util/Profile";
import Loading from "../../../util/ui/Loading";
import Dialog from "../../../util/ui/Dialog";
import { Lobby as LobbyData } from "../data/Lobby";
import { getColor } from "../data/Player";
import { Game } from "../data/Game";

interface LobbyProps {
    communicator: LabyrinthCommunicator;
    onStartGame: (lobby: LobbyData) => void;
    onJoinGame: (game: Game) => void;
}

interface State {
    type: StateType;
}

enum StateType { LOADING, MAIN, LOBBY }

interface LoadingState extends State { }

interface MainState extends State {
    profile: Profile;
}

interface LobbyState extends State {
    profile: Profile;
}

const Lobby: React.FC<LobbyProps> = ({ communicator, onStartGame, onJoinGame }) => {
    const [state, setState] = useState<State>(() => {
        const loadingState: LoadingState = { type: StateType.LOADING };

        return loadingState;
    });

    const lastestState = useRef(state);

    const [lobby, setLobby] = useState<LobbyData | null | undefined>(undefined);

    const [game, setGame] = useState<Game | null | undefined>(undefined);

    useEffect(() => {
        lastestState.current = state;
    }, [state]);

    useEffect(() => {
        getProfile().then(profile => {
            const mainState: MainState = {
                type: StateType.MAIN,
                profile: profile
            };

            setState(mainState);
        });

        communicator.getLobby().then(lobby => setLobby(lobby));

        communicator.getGame().then(game => setGame(game));

        communicator.setLobbyUpdateListener(() => communicator.getLobby().then(lobby => setLobby(lobby)));

        communicator.setGameUpdateListener(() => communicator.getGame().then(game => {
            setGame(game);

            // If you're in lobby state and in this game, then join the game
            if (game !== null && isLobbyState(lastestState.current)) {
                const id = lastestState.current.profile.id;
                const youAreInGame = game.players.find(player => player.id === id) !== undefined;

                if (youAreInGame) {
                    onJoinGame(game);
                }
            }
        }));
    }, []);

    const onCreateGame = (profile: Profile) => {
        const lobbyData: LobbyData = {
            ownerId: profile.id,
            players: [{
                id: profile.id,
                name: profile.name
            }]
        };

        communicator.createLobby(lobbyData);

        const lobbyState: LobbyState = { type: StateType.LOBBY, profile: profile };

        setLobby(lobbyData);
        setState(lobbyState);
    };

    const onJoinLobby = (profile: Profile, lobbyData: LobbyData) => {
        const notAlreadyInLobby = lobbyData.players.find(player => player.id === profile.id) === undefined;

        if (notAlreadyInLobby) {
            lobbyData.players.push({
                name: profile.name,
                id: profile.id
            });

            communicator.createLobby(lobbyData);
        }

        const lobbyState: LobbyState = { type: StateType.LOBBY, profile: profile };

        setLobby(lobbyData);
        setState(lobbyState);
    };

    if (isMainState(state)) {
        return mainUi(state, onCreateGame, lobby, lobby => onJoinLobby(state.profile, lobby), game, onJoinGame);
    } else if (isLobbyState(state)) {
        return lobbyUi(lobby!, onStartGame, state.profile);
    } else {
        return loadingUi();
    }
};

function mainUi(
    state: MainState,
    onCreateGame: (profile: Profile) => void,
    lobby: LobbyData | null | undefined,
    onJoinLobby: (lobby: LobbyData) => void,
    game: Game | null | undefined,
    onJoinGame: (game: Game) => void
): JSX.Element {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.5em', flexDirection: 'column' }}>
        <div style={{ fontSize: '1.5em', marginBottom: '25px', fontWeight: 'bold' }}>🧭 Labyrinth 🧩</div>
        <div>Hello {getPlayerName(state.profile.name)}</div>
        <button style={{ fontSize: '1em', marginTop: '15px' }} onClick={() => onCreateGame(state.profile)}>Create Game</button>
        <div style={{ fontWeight: 'bold', margin: '15px 0px', fontSize: '1.25em' }}>Lobby</div>
        {lobbySectionUi(lobby, onJoinLobby)}
        <div style={{ fontWeight: 'bold', margin: '15px 0px', fontSize: '1.25em' }}>Games</div>
        {gameSectionUi(game, onJoinGame)}
    </div>;
}

function lobbySectionUi(lobby: LobbyData | null | undefined, onJoinLobby: (lobby: LobbyData) => void): JSX.Element {
    if (lobby === undefined) {
        return <Loading />;
    } else if (lobby === null) {
        return <div>(none)</div>
    } else {
        return <div style={{ border: '2px solid white', margin: '10px', padding: '10px', borderRadius: '10px' }}>
            {getGameName(lobby.players[0].name)} ({lobby.players.length}/4) <button style={{ fontSize: '1em' }} onClick={() => onJoinLobby(lobby)}>Join</button>
        </div>;
    }
}

function gameSectionUi(game: Game | null | undefined, onJoinGame: (game: Game) => void): JSX.Element {
    if (game === undefined) {
        return <Loading />;
    } else if (game === null) {
        return <div>(none)</div>;
    } else {
        return <div style={{ border: '2px solid white', margin: '10px', padding: '10px', borderRadius: '10px' }}>
            {getGameName(game.players[0].name)} ({game.players.length}/4) <button style={{ fontSize: '1em' }} onClick={() => onJoinGame(game)}>Join</button>
        </div>;
    }
}

function lobbyUi(lobby: LobbyData, onStartGame: (lobby: LobbyData) => void, profile: Profile): JSX.Element {
    const players = lobby.players.map((player, index) => {
        return <div key={index} style={{ border: `2px solid ${getColor(index)}`, borderRadius: '15px', padding: '5px', margin: '5px' }}>{player.name}</div>;
    });

    const loadingUi = lobby.players.length < 4 ? <Loading /> : <></>;

    const button = lobby.ownerId === profile.id
        ? <button style={{ fontSize: '1em', marginTop: '25px' }} onClick={() => onStartGame(lobby)}>Start Game</button>
        : <div style={{ fontSize: '1em', marginTop: '25px' }}>Waiting for Host</div>;

    return <Dialog>
        <div style={{ color: 'white', fontSize: '2em', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '25px', fontSize: '1.2em', fontWeight: 'bold' }}>{getGameName(lobby.players[0].name)}</div>
            <div style={{ fontWeight: 'bold' }}>Players ({lobby.players.length}/4)</div>
            {players}
            {loadingUi}
            {button}
        </div>
    </Dialog>;
}

function loadingUi(): JSX.Element {
    return <Dialog>
        <div style={{ color: 'white', fontSize: '2em', textAlign: 'center', marginBottom: '25px', fontWeight: 'bold' }}>Loading Profile</div>
        <Loading />
    </Dialog>;
}

function getGameName(name: string): JSX.Element {
    return <>{getPlayerName(name)}'s Game</>;
}

function getPlayerName(name: string): JSX.Element {
    return <span style={{ color: 'var(--novelty-blue)' }}>{name}</span>;
}

function isMainState(state: State): state is MainState {
    return state.type === StateType.MAIN;
}

function isLobbyState(state: State): state is LobbyState {
    return state.type === StateType.LOBBY;
}

export default Lobby;
