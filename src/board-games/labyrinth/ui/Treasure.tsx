import { TreasureDetails } from "../data/Player";
import { getTreasureImage } from "../data/Treasure";
import QuestionMarkImage from '../images/question-mark.png';

interface TreasureProps {
    details: TreasureDetails;
}

const Treasure: React.FC<TreasureProps> = ({ details }) => {
    const cardsUi = details.pile.map((card, index) => {
        const isCardKnown = index <= details.targetIndex;
        const isCardCollected = index < details.targetIndex;

        const src = isCardKnown ? getTreasureImage(card) : QuestionMarkImage;

        const backgroundColor = isCardKnown ? isCardCollected ? 'lime' : 'white' : 'black';

        return <img key={index} style={{
            border: '2px solid white',
            borderRadius: '25%',
            padding: '10%',
            margin: '5%',
            background: `radial-gradient(circle, transparent 50%, ${backgroundColor})`
        }} src={src} alt='' />;
    });

    return <div style={{ display: 'grid', gridTemplateRows: 'repeat(auto-fit, minmax(0, 1fr))', placeItems: 'stretch', height: '100vh', maxHeight: '55em' }}>
        {cardsUi}
    </div>;
};

export default Treasure;
