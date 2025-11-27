import { GameData } from "../data/GameData";

interface GameProps {
    data: GameData;
}

const Game: React.FC<GameProps> = ({ data }) => {
    return <div>
        Your cards: {data.player.card1}, {data.player.card2}
    </div>;
};

export default Game;
