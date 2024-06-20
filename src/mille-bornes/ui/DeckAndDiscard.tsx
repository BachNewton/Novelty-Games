import { Card } from "../logic/Card";
import CardUi from "../ui/Card";

interface DeckAndDiscardProps {
    discard: Card | null;
}

const DeckAndDiscard: React.FC<DeckAndDiscardProps> = ({ discard }) => {

    return <div style={{ display: 'grid', gridAutoFlow: 'column', justifyContent: 'start', alignContent: 'space-between', minHeight: 0 }}>
        <CardUi />
        <CardUi card={discard} />
    </div>;
};

export default DeckAndDiscard;
