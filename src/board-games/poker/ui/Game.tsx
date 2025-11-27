import { GameData } from "../data/GameData";

interface GameProps {
    data: GameData;
    isYourTurn: boolean;
}

const Game: React.FC<GameProps> = ({ data, isYourTurn }) => {
    return <div>
        <div>Your cards: {data.player.card1}, {data.player.card2}</div>
        {isYourTurn ? <div>It's your turn!</div> : <div>Waiting for other players...</div>}
    </div>;
};

export default Game;
