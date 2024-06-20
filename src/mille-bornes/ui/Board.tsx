import '../css/Cards.css';
import { useState } from "react";
import { Card } from "../logic/Card";
import { Game } from "../logic/Data";
import { playCard } from "../logic/Rules";
import Hand from './Hand';
import TableauUi from "./Tableau";
import CardUi from "./Card";
import MB_OUTLINE from "../images/MB-outline.svg";

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

    // return <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '100vh', overflow: 'hidden' }}>
    //     <div className="cards" style={{ minHeight: 0, display: 'flex' }}>
    //         <CardUi />
    //         <CardUi card={game.discard} />
    //     </div>
    //     {otherPlayersTableau}
    //     <TableauUi tableauData={game.currentPlayer.tableau} />
    //     <Hand hand={game.currentPlayer.hand} onPlayCard={onPlayCard} />
    // </div>;

    const imgStyle: React.CSSProperties = {
        minHeight: 0,
        height: '100%',
        objectFit: 'contain',
        width: '100%',
        objectPosition: 'bottom'
    };

    const table = <div style={{ display: 'grid', gridAutoFlow: 'column', justifyContent: 'space-evenly', minHeight: 0 }}>
        <div style={{ display: 'grid', alignContent: 'center', minHeight: 0 }}>
            <div style={{ display: 'grid', gridAutoFlow: 'column', minHeight: 0 }}>
                <img style={imgStyle} src={MB_OUTLINE} />
                <img style={imgStyle} src={MB_OUTLINE} />
                <img style={imgStyle} src={MB_OUTLINE} />
                <img style={imgStyle} src={MB_OUTLINE} />
            </div>
            <div style={{ display: 'grid', gridAutoFlow: 'column', minHeight: 0 }}>
                <img style={imgStyle} src={MB_OUTLINE} />
                <img style={imgStyle} src={MB_OUTLINE} />
                <img style={imgStyle} src={MB_OUTLINE} />
                <img style={imgStyle} src={MB_OUTLINE} />
                <img style={imgStyle} src={MB_OUTLINE} />
            </div>
        </div>

        <div style={{ display: 'grid', minHeight: 0 }}>
            <img style={imgStyle} src={MB_OUTLINE} />
            <img style={imgStyle} src={MB_OUTLINE} />
        </div>
    </div>;

    return <div style={{ display: 'grid', height: '100vh', gridTemplateRows: '1fr 3fr 3fr 3fr' }}>
        <div style={{ display: 'grid', gridAutoFlow: 'column', justifyContent: 'start', alignContent: 'space-between', minHeight: 0 }}>
            <img style={imgStyle} src={MB_OUTLINE} />
            <img style={imgStyle} src={MB_OUTLINE} />
        </div>


        {table}
        {table}
        {table}


        <div style={{ display: 'grid', gridAutoFlow: 'column', minHeight: 0 }}>
            <img style={imgStyle} src={MB_OUTLINE} />
            <img style={imgStyle} src={MB_OUTLINE} />
            <img style={imgStyle} src={MB_OUTLINE} />
            <img style={imgStyle} src={MB_OUTLINE} />
            <img style={imgStyle} src={MB_OUTLINE} />
            <img style={imgStyle} src={MB_OUTLINE} />
            <img style={imgStyle} src={MB_OUTLINE} />
        </div>
    </div>;
};

export default Board;
