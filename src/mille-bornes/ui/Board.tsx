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

    const otherTeamsTableau = game.teams.filter(team => team !== game.currentPlayer.team).map((otherTeam, index) =>
        <TableauUi team={otherTeam} key={index} />
    );

    const gridTemplateRows = '1fr ' + game.teams.map(_ => '3fr').join(' ') + '1fr';
    return <div style={{ display: 'grid', height: '100vh', gridTemplateRows: gridTemplateRows, overflow: 'hidden', color: 'white' }}>
        <DeckAndDiscard discard={game.discard} />

        {otherTeamsTableau}
        <TableauUi team={game.currentPlayer.team} />

        <Hand hand={game.currentPlayer.hand} onPlayCard={onPlayCard} />
    </div>;
};

export default Board;
