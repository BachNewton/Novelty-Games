import { getTreasureImage, Treasure as TreasureData } from "../data/Treasure";

interface TreasureProps {
    cards: TreasureData[];
}

const Treasure: React.FC<TreasureProps> = ({ cards }) => {
    const cardsUi = cards.map((card, index) => {
        return <img key={index} style={{ border: '2px solid white', borderRadius: '25%', padding: '10%', margin: '5%' }} src={getTreasureImage(card)} />;
    });

    return <div style={{ display: 'grid', gridTemplateRows: 'repeat(auto-fit, minmax(0, 1fr))', placeItems: 'stretch', height: '100vh', maxHeight: '55em' }}>
        {cardsUi}
    </div>;
};

export default Treasure;
