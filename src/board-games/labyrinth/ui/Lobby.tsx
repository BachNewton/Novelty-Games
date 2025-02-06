import { useEffect, useState } from "react";
import { LabyrinthCommunicator } from "../logic/LabyrinthCommunicator";
import { getProfile, Profile } from "../../../util/Profile";
import Loading from "../../../util/ui/Loading";
import Dialog from "../../../util/ui/Dialog";
import { Lobby as LobbyData } from "../data/Lobby";
import { getColor } from "../data/Player";

interface LobbyProps {
    communicator: LabyrinthCommunicator;
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
    lobby: LobbyData;
}

const Lobby: React.FC<LobbyProps> = ({ communicator }) => {
    const [state, setState] = useState<State>(() => {
        const loadingState: LoadingState = { type: StateType.LOADING };

        return loadingState;
    });

    const [lobby, setLobby] = useState<LobbyData | null | undefined>(undefined);

    useEffect(() => {
        getProfile().then(profile => {
            const mainState: MainState = {
                type: StateType.MAIN,
                profile: profile
            };

            setState(mainState);
        });

        communicator.getLobby().then(lobby => setLobby(lobby));
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

        const lobbyState: LobbyState = {
            type: StateType.LOBBY,
            lobby: lobbyData
        };

        setState(lobbyState);
    };

    if (isMainState(state)) {
        return mainUi(state, onCreateGame, lobby);
    } else if (isLobbyState(state)) {
        return lobbyUi(state);
    } else {
        return loadingUi();
    }
};

function mainUi(state: MainState, onCreateGame: (profile: Profile) => void, lobby: LobbyData | null | undefined): JSX.Element {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.5em', flexDirection: 'column' }}>
        <div style={{ fontSize: '1.5em', marginBottom: '25px', fontWeight: 'bold' }}>🧭 Labyrinth 🧩</div>
        <button style={{ fontSize: '1em' }} onClick={() => onCreateGame(state.profile)}>Create Game</button>
        <div style={{ fontWeight: 'bold', margin: '15px 0px', fontSize: '1.25em' }}>Lobby</div>
        {lobbySectionUi(lobby)}
        <div style={{ fontWeight: 'bold', margin: '15px 0px', fontSize: '1.25em' }}>Games</div>
        <div>(None)</div>
    </div>;
}

function lobbySectionUi(lobby: LobbyData | null | undefined): JSX.Element {
    if (lobby === undefined) {
        return <Loading />;
    } else if (lobby === null) {
        return <div>(none)</div>
    } else {
        return <div style={{ border: '2px solid white', margin: '10px', padding: '10px', borderRadius: '10px' }}>
            {getGameName(lobby.players[0].name)} <button style={{ fontSize: '1em' }}>Join</button>
        </div>;
    }
}

function lobbyUi(state: LobbyState): JSX.Element {
    const players = state.lobby.players.map((player, index) => {
        return <div key={index} style={{ border: `2px solid ${getColor(index)}`, borderRadius: '15px', padding: '5px', margin: '5px' }}>{player.name}</div>;
    });

    const loadingUi = state.lobby.players.length < 4 ? <Loading /> : <></>;

    return <Dialog>
        <div style={{ color: 'white', fontSize: '2em', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '25px', fontSize: '1.2em', fontWeight: 'bold' }}>{getGameName(state.lobby.players[0].name)}</div>
            <div style={{ fontWeight: 'bold' }}>Players</div>
            {players}
            {loadingUi}
            <button style={{ fontSize: '1em', marginTop: '25px' }}>Start Game</button>
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
    return <><span style={{ color: 'var(--novelty-blue)' }}>{name}</span>'s Game</>;
}

function isMainState(state: State): state is MainState {
    return state.type === StateType.MAIN;
}

function isLobbyState(state: State): state is LobbyState {
    return state.type === StateType.LOBBY;
}

export default Lobby;
