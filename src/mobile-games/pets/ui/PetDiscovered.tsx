import { Pet } from "../data/Pet";
import FriendshipBar from "./FriendshipBar";
import SpeechBubble from "./SpeechBubble";

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
    return <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%' }}>
        <SpeechBubble text={text} />
    </div>;
}

export default PetDiscovered;
