import { Game } from "../logic/Data";
import Hand from './Hand';
import TableauUi from "./Tableau";

interface BoardProps {
    game: Game;
}

const Board: React.FC<BoardProps> = ({ game }) => {
    return <div>
        <TableauUi tableauData={game.tableau} />
        <Hand hand={game.hand} />
    </div>
};

export default Board;
