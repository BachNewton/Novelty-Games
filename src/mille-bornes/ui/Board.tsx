import '../css/Cards.css';
import { Card } from "../logic/Card";
import { Game } from "../logic/Data";
import CardUi from "./Card";
import TableauUi from "./Tableau";

interface BoardProps {
    game: Game;
}

const Board: React.FC<BoardProps> = ({ game }) => {
    return <div>
        <TableauUi tableauData={game.tableau} />
        {HandUi(game.hand)}
    </div>
};

function HandUi(hand: Array<Card>) {
    const cards = hand.map((card, index) =>
        <CardUi card={card} key={index} />
    );

    return <div className="cards">
        {cards}
    </div>;
}

export default Board;
