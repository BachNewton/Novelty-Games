import { Card } from "../logic/Card";
import CardUi from "./Card";

interface DeckDiscardProps {
    discard: Card | null;
    greyedOut: boolean;
    remainingCardsInDeck: number;
    onDiscardClicked: () => void;
    isDiscardHighlighted: boolean;
}

const DeckDiscard: React.FC<DeckDiscardProps> = ({ discard, greyedOut, remainingCardsInDeck, onDiscardClicked, isDiscardHighlighted }) => {
    const style: React.CSSProperties = {
        display: 'grid',
        gridAutoFlow: 'column',
        justifyContent: 'start',
        alignContent: 'space-between',
        minHeight: 0,
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
        <div style={{ minHeight: 0, opacity: greyedOut ? 0.1 : 1 }}>
            <CardUi card={remainingCardsInDeck === 0 ? null : undefined} />
            <div style={remainingCardsInDeckNumberStyle}>
                {remainingCardsInDeck}
            </div>
        </div>
        <CardUi card={discard} onClick={onDiscardClicked} isHighlighted={isDiscardHighlighted} />
    </div>;
};

export default DeckDiscard;
