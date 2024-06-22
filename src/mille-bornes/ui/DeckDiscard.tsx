import { Card } from "../logic/Card";
import CardUi from "./Card";

interface DeckDiscardProps {
    discard: Card | null;
    greyedOut: boolean;
}

const DeckDiscard: React.FC<DeckDiscardProps> = ({ discard, greyedOut }) => {
    const style: React.CSSProperties = {
        display: 'grid',
        gridAutoFlow: 'column',
        justifyContent: 'start',
        alignContent: 'space-between',
        minHeight: 0,
        opacity: greyedOut ? 0.1 : 1
    };

    return <div style={style}>
        <CardUi />
        <CardUi card={discard} />
    </div>;
};

export default DeckDiscard;
