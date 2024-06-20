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

    const otherPlayersTableau = game.players.filter(player => player !== game.currentPlayer).map((otherPlayer, index) =>
        <TableauUi tableauData={otherPlayer.tableau} key={index} />
    );

    return <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '100vh', overflow: 'hidden' }}>
        <div className="cards" style={{ minHeight: 0, display: 'flex' }}>
            <CardUi />
            <CardUi card={game.discard} />
        </div>
        {otherPlayersTableau}
        <TableauUi tableauData={game.currentPlayer.tableau} />
        <Hand hand={game.currentPlayer.hand} onPlayCard={onPlayCard} />
    </div>;

    // const catImage = 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500';

    // const style: React.CSSProperties = {
    //     borderColor: 'yellow',
    //     borderWidth: '1px',
    //     borderStyle: 'solid',
    //     boxSizing: 'border-box',
    //     minHeight: 0,
    //     display: 'flex'
    // };

    // const catStyle: React.CSSProperties = {
    //     borderColor: 'magenta',
    //     borderWidth: '1px',
    //     borderStyle: 'solid',
    //     boxSizing: 'border-box',
    //     objectFit: 'contain',
    //     width: '100%'
    // };

    // return <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '100vh' }}>
    //     {/* <div style={{ flexGrow: 2, display: 'flex' }}>
    //         <div style={{ minHeight: 0, display: 'flex' }}>
    //             <img style={{}} src={catImage} />
    //         </div>
    //     </div>
    //     <div style={{ flexGrow: 1, display: 'flex' }}>
    //         <div style={{ minHeight: 0, display: 'flex' }}>
    //             <img style={{}} src={catImage} />
    //         </div>
    //     </div>
    //     <div style={{ flexGrow: 2, display: 'flex' }}>
    //         <div style={{ minHeight: 0, display: 'flex' }}>
    //             <img style={{}} src={catImage} />
    //         </div>
    //     </div>
    //     <div style={{ flexGrow: 2, display: 'flex' }}>
    //         <div style={{ minHeight: 0, display: 'flex' }}>
    //             <img style={{}} src={catImage} />
    //         </div>
    //     </div> */}
    //     <div style={style}><img style={catStyle} src={catImage} /></div>
    //     <div style={{
    //         borderColor: 'yellow',
    //         borderWidth: '1px',
    //         borderStyle: 'solid',
    //         boxSizing: 'border-box',
    //         minHeight: 0,
    //         display: 'flex'
    //     }}>
    //         <div style={style}><img style={catStyle} src={catImage} /></div>
    //         <div style={style}><img style={catStyle} src={catImage} /></div>
    //     </div>
    //     <div style={style}><img style={catStyle} src={catImage} /></div>
    //     <div style={style}><img style={catStyle} src={catImage} /></div>
    //     <div style={style}><img style={catStyle} src={catImage} /></div>
    //     <div style={style}><img style={catStyle} src={catImage} /></div>
    //     <div style={style}><img style={catStyle} src={catImage} /></div>
    // </div>
};

export default Board;
