import { useEffect, useState } from "react";
import { Communicator, LobbyEvent } from "../logic/Communicator";
import HomeButton from "../../ui/HomeButton";

interface LobbyProps {
    communicator: Communicator;
    startGame: (lobbyTeams: Array<LobbyTeam>) => void;
    localId: string;
    onHomeButtonClicked: () => void;
}

export interface LobbyTeam {
    players: Array<LobbyPlayer>;
    accumulatedScore: number;
}

export interface LobbyPlayer {
    name: string;
    localId: string;
}

const Lobby: React.FC<LobbyProps> = ({ communicator, startGame, localId, onHomeButtonClicked }) => {
    const [lobbyTeams, setLobbyTeams] = useState<Array<LobbyTeam>>([
        { players: [{ name: 'Kyle', localId: localId }], accumulatedScore: 0 },
        { players: [{ name: 'Eric', localId: localId }], accumulatedScore: 0 }
    ]);

    useEffect(() => {
        communicator.addEventListener(LobbyEvent.TYPE, (event) => {
            setLobbyTeams([...(event as LobbyEvent).lobbyTeams]);
        });
    }, [communicator]);

    const onAddTeam = () => {
        lobbyTeams.push({
            players: [],
            accumulatedScore: 0
        });

        setLobbyTeams([...lobbyTeams]);
        communicator.updateLobby(lobbyTeams);
    };

    const addTeamButton = lobbyTeams.length < 3
        ? <button style={{ fontSize: '1em' }} onClick={onAddTeam}>Add Team</button>
        : <></>;

    const lobbyTeamsUi = lobbyTeams.map((lobbyTeam, index) => {
        const onAddPlayer = () => {
            const name = prompt('What is the name of this player?') || 'Player';
            lobbyTeam.players.push({
                name: name,
                localId: localId
            });

            setLobbyTeams([...lobbyTeams]);
            communicator.updateLobby(lobbyTeams);
        };

        const addPlayerButton = lobbyTeam.players.length < 2
            ? <button style={{ fontSize: '1em' }} onClick={onAddPlayer}>Add Player</button>
            : <></>;

        const onRemovePlayer = (removePlayer: LobbyPlayer) => {
            lobbyTeam.players = lobbyTeam.players.filter(player => player !== removePlayer);
            setLobbyTeams([...lobbyTeams]);
            communicator.updateLobby(lobbyTeams);
        };

        const playersUi = lobbyTeam.players.map((player, index) => <tr key={index}>
            <td style={{ fontSize: '1.5em' }}>{player.name}</td>
            <td style={{ textAlign: 'center' }}><button style={{ fontSize: '1em' }} onClick={() => onRemovePlayer(player)}>Remove</button></td>
        </tr>);

        return <table key={index} style={{ fontSize: '1em', border: '1px solid white', padding: '0.5em 0', margin: '1em 0', width: '75%' }}>
            <thead>
                <tr>
                    <th>Team #{index + 1}</th>
                    <th>{addPlayerButton}</th>
                </tr>
            </thead>
            <tbody>
                {playersUi}
            </tbody>
        </table>;
    });

    const onStartGame = () => {
        startGame(lobbyTeams);
    };

    const startGameButton = lobbyTeams.length >= 2 && lobbyTeams.every(team => team.players.length >= 1)
        ? <button style={{ fontSize: '1.5em' }} onClick={onStartGame}>Start Game</button>
        : <></>;

    const homeButtonStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        marginTop: '0.3em',
        marginLeft: '0.3em',
        fontSize: '1em'
    };

    return <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <HomeButton onClick={onHomeButtonClicked} />
        <div style={{ fontSize: '1.75em', marginBottom: '1em' }}>🏎️ Mille Bornes Lobby 🏁</div>
        <div>
            {addTeamButton}
        </div>
        {lobbyTeamsUi}
        {startGameButton}
    </div>;
};

export default Lobby;
