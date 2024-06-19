import '../css/Cards.css';
import { useState } from "react";
import { Card } from "../logic/Card";
import { Game } from "../logic/Data";
import { playCard } from "../logic/Rules";
import Hand from './Hand';
import TableauUi from "./Tableau";
import CardUi from "./Card";

interface BoardProps {
    game: Game;
}

const Board: React.FC<BoardProps> = ({ game }) => {
    const [state, setState] = useState(game);

    const onPlayCard = (card: Card) => {
        playCard(card, game);
        setState({ ...state });
    };

    return <div>
        <div className="cards">
            <CardUi />
            <CardUi card={game.discard} />
        </div>
        <TableauUi tableauData={game.tableau} />
        <Hand hand={game.hand} onPlayCard={onPlayCard} />
    </div>
};

export default Board;
