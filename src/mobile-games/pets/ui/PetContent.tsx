import { Pet } from "../data/Pet";
import FriendshipBar from "./FriendshipBar";
import { COLORS } from "./Home";
import TextReveal from "./TextReveal";

interface PetContentProps {
    pets: Pet[];
    selectedTab: number;
    text: string;
    image: string;
}

const PetContent: React.FC<PetContentProps> = ({ pets, selectedTab, text, image }) => {
    const selectedPet = pets[selectedTab];
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
    return <div style={{
        position: 'absolute',
        bottom: '0',
        width: 'calc(100% - 15px)',
        minHeight: '2.5em',
        margin: '7.5px',
        border: `2px solid ${COLORS.primary}`,
        borderRadius: '25px',
        padding: '10px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        boxSizing: 'border-box',
        fontFamily: 'Pet',
        fontSize: '1.2em'
    }}>
        <TextReveal>
            {text}
        </TextReveal>
    </div>;
}

export default PetContent;
