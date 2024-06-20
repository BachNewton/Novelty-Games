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
            <CardUi card={distanceCard} translateY={index * -90} key={index} />
        );

        return <div key={index}>
            {distanceCardsUi}
        </div>;
    });


    return <div style={{ display: 'flex', minHeight: 0 }}>
        {distanceAreaUi}
    </div>;
};

export default DistanceArea;
