import { Card } from "../logic/Card";
import CardUi from "./Card";

interface DeckDiscardProps {
    discard: Card | null;
    greyedOut: boolean;
    remainingCardsInDeck: number;
}

const DeckDiscard: React.FC<DeckDiscardProps> = ({ discard, greyedOut, remainingCardsInDeck }) => {
    const style: React.CSSProperties = {
        display: 'grid',
        gridAutoFlow: 'column',
        justifyContent: 'start',
        alignContent: 'space-between',
        minHeight: 0,
        opacity: greyedOut ? 0.1 : 1,
        gridTemplateColumns: '1fr 1fr'
    };

    const remainingCardsInDeckNumberStyle: React.CSSProperties = {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: 'translateY(-100%)',
        fontSize: '1.5em'
    };

    return <div style={style}>
        <div style={{ minHeight: 0 }}>
            <CardUi card={remainingCardsInDeck === 0 ? null : undefined} />
            <div style={remainingCardsInDeckNumberStyle}>
                {remainingCardsInDeck}
            </div>
        </div>
        <CardUi card={discard} />
    </div>;
};

export default DeckDiscard;
