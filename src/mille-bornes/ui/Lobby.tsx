import { Communicator } from "../logic/Communicator";
import { Game } from "../logic/Data";
import { startGame } from "../logic/GameCreator";

interface LobbyProps {
    communicator: Communicator;
    onReady: (game: Game) => void;
}

const Lobby: React.FC<LobbyProps> = ({ communicator, onReady }) => {
    const onJoin = () => { };

    const onCreate = () => {
        const game = startGame();
        onReady(game);
    };

    return <div>
        <button onClick={onJoin}>Join</button>
        <button onClick={onCreate}>Create</button>
    </div>;
};

export default Lobby;
