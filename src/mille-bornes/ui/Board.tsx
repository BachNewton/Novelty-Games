import { useState } from "react";
import { Card } from "../logic/Card";
import { Game } from "../logic/Data";
import { playCard } from "../logic/Rules";
import Hand from './Hand';
import TableauUi from "./Tableau";
import DeckAndDiscard from './DeckAndDiscard';

interface BoardProps {
    game: Game;
}

const Board: React.FC<BoardProps> = ({ game }) => {
    const [state, setState] = useState(game);

    const onPlayCard = (card: Card) => {
        playCard(card, game);
        setState({ ...state });
    };

    const otherPlayersTableau = game.players.filter(player => player !== game.currentPlayer).map((otherPlayer, index) =>
        <TableauUi tableauData={otherPlayer.tableau} key={index} />
    );

    return <div style={{ display: 'grid', height: '100vh', gridTemplateRows: '1fr 3fr 3fr 1fr' }}>
        <DeckAndDiscard discard={game.discard} />

        {otherPlayersTableau}
        <TableauUi tableauData={game.currentPlayer.tableau} />

        <Hand hand={game.currentPlayer.hand} onPlayCard={onPlayCard} />
    </div>;
};

export default Board;
