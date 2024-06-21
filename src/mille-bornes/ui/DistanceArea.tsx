import { DistanceCard } from "../logic/Card";
import CardUi from "../ui/Card";

interface DistanceAreaProps {
    distanceArea: Array<DistanceCard>;
}

const DISTANCE_CARD_AMOUNTS = [25, 50, 75, 100, 200];

const DistanceArea: React.FC<DistanceAreaProps> = ({ distanceArea }) => {
    const distanceAreaUi = DISTANCE_CARD_AMOUNTS.map((amount, index) => {
        const distanceCards = distanceArea.filter(distanceCard => distanceCard.amount === amount);
        const distanceCardsUi = distanceCards.map((distanceCard, index) =>
            <CardUi transform={`translateY(${-index * 90}%)`} card={distanceCard} key={index} />
        );

        return <div style={{ display: 'grid', minHeight: 0, height: `${60 * distanceCards.length}%`, zIndex: -1 }} key={index}>
            {distanceCardsUi}
        </div>;
    });

    return <div style={{ display: 'grid', gridAutoFlow: 'column', minHeight: 0 }}>
        {distanceAreaUi}
    </div>
};

export default DistanceArea;
