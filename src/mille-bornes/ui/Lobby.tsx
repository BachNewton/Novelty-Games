import { Communicator } from "../logic/Communicator";
import { startGame } from "../logic/GameCreator";

interface LobbyProps {
    communicator: Communicator;
}

const Lobby: React.FC<LobbyProps> = ({ communicator }) => {
    const onJoin = () => { };

    const onCreate = () => {
        const game = startGame();
        communicator.startGame(game);
    };

    return <div>
        <button onClick={onJoin}>Join</button>
        <button onClick={onCreate}>Create</button>
    </div>;
};

export default Lobby;
