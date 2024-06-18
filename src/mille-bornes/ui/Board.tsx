import MB_BACK from '../images/MB-back.svg';
import { Card, Game } from '../logic/Data';

interface BoardProps {
    game: Game;
}

const Board: React.FC<BoardProps> = ({ game }) => {
    const hand = game.hand.map((card, index) =>
        <div key={index} style={{ flexGrow: 1 }}>
            <img src={card.image} style={{ maxWidth: '100%' }} />
        </div>
    );

    return <div style={{
        display: 'flex', maxWidth: '100vw'
    }}>
        {hand}
    </div >;
};

export default Board;
