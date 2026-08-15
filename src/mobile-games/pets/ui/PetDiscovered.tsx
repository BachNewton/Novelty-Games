import { Pet } from "../data/Pet";
import FriendshipBar from "./FriendshipBar";
import TextBubble from "./TextBubble";

interface PetDiscoveredProps {
    selectedPet: Pet;
    selectedTab: number;
    text: string;
    image: string;
}

const PetDiscovered: React.FC<PetDiscoveredProps> = ({ selectedPet, selectedTab, text, image }) => {
    const isDiscovered = selectedPet.discovered;

    return <>
        {petImageUi(image)}

        <FriendshipBar
            isDiscovered={isDiscovered}
            level={selectedPet.friendship}
            animationKey={selectedTab}
        />

        {textBubbleUi(text)}
    </>;
};

function petImageUi(image: string): JSX.Element {
    return <img
        src={image}
        alt=''
        style={{
            maxWidth: '100%',
            maxHeight: '100%',
            maskImage: 'radial-gradient(circle, black 60%, transparent 75%)'
        }}
    />;
}

function textBubbleUi(text: string): JSX.Element {
    return <TextBubble text={text} style={{
        position: 'absolute',
        bottom: '0',
        width: 'calc(100% - 15px)',
        margin: '7.5px'
    }} />;
}

export default PetDiscovered;
