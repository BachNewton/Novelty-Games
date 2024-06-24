import { useEffect, useState } from "react";
import { Communicator, LobbyEvent } from "../logic/Communicator";

interface LobbyProps {
    communicator: Communicator;
    startGame: (lobbyTeams: Array<LobbyTeam>) => void;
    localId: string;
}

export interface LobbyTeam {
    players: Array<LobbyPlayer>;
}

interface LobbyPlayer {
    name: string;
    localId: string;
}

const Lobby: React.FC<LobbyProps> = ({ communicator, startGame, localId }) => {
    const [lobbyTeams, setLobbyTeams] = useState<Array<LobbyTeam>>([
        // { players: [{ name: 'Kyle', localId: localId }] },
        // { players: [{ name: 'Eric', localId: localId }] }
    ]);

    useEffect(() => {
        communicator.addEventListener(LobbyEvent.TYPE, (event) => {
            setLobbyTeams([...(event as LobbyEvent).lobbyTeams]);
        });
    }, [communicator]);

    const onAddTeam = () => {
        lobbyTeams.push({
            players: []
        });

        setLobbyTeams([...lobbyTeams]);
        communicator.updateLobby(lobbyTeams);
    };

    const addTeamButton = lobbyTeams.length < 3
        ? <button onClick={onAddTeam}>Add Team</button>
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
            ? <button onClick={onAddPlayer}>Add Player</button>
            : <></>;

        const playersUi = lobbyTeam.players.map((player, index) => <div key={index}>
            {player.name}
        </div>);

        return <div key={index}>
            <div>
                ----- Team #{index + 1} -----
            </div>
            {addPlayerButton}
            {playersUi}
        </div>;
    });

    const onStartGame = () => {
        startGame(lobbyTeams);
    };

    const startGameButton = lobbyTeams.length >= 2 && lobbyTeams.every(team => team.players.length >= 1)
        ? <button onClick={onStartGame}>Start Game</button>
        : <></>;

    return <div>
        ----- Lobby -----
        <div>
            {addTeamButton}
        </div>
        {lobbyTeamsUi}
        {startGameButton}
    </div>;
};

export default Lobby;
