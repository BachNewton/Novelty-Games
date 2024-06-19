import { Card } from "../logic/Card";
import { Game } from "../logic/Data";
import Hand from './Hand';
import TableauUi from "./Tableau";

interface BoardProps {
    game: Game;
}

const Board: React.FC<BoardProps> = ({ game }) => {
    const onPlayCard = (card: Card) => {
        console.log(card);
    };

    return <div>
        <TableauUi tableauData={game.tableau} />
        <Hand hand={game.hand} onPlayCard={onPlayCard} />
    </div>
};

export default Board;
