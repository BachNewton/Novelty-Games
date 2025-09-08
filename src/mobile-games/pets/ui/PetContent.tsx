import { useEffect, useState } from "react";
import Button from "../../../util/ui/Button";
import { COLORS, InteractionSelection } from "./Home";
import PetDiscovered from "./PetDiscovered";
import Discover from "./Discover";
import { Pet } from "../data/Pet";
import { DataManager, PetTextAndImage } from "../logic/DataManager";
import DebugMenu from "./DebugMenu";
import { PetsDebugger } from "../logic/PetsDebugger";

const SHOW_DEBUG_MENU_BUTTON = true;

interface PetContentProps {
    pets: Pet[];
    selectedPet: Pet;
    selectedTab: number;
    hasLoaded: boolean;
    interteractionSelection: InteractionSelection | null;
    dataManager: DataManager;
    petsDebugger: PetsDebugger;
    setPets: (pets: Pet[]) => void;
    setDistanceToPet: (distance: number | null) => void;
}

const PetContent: React.FC<PetContentProps> = ({
    pets,
    selectedPet,
    selectedTab,
    hasLoaded,
    interteractionSelection,
    dataManager,
    petsDebugger,
    setPets,
    setDistanceToPet
}) => {
    const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
    const [textAndImage, setTextAndImage] = useState<PetTextAndImage>({ text: '', image: null });

    const isDiscovered = selectedPet.discovered;

    const discoverPet = () => {
        const updatedPet = dataManager.discoverPetInDatabase(selectedTab);

        pets[selectedTab] = {
            ...pets[selectedTab],
            ...updatedPet
        };

        setPets([...pets]);
        setTextAndImage(dataManager.getTextAndImage(pets[selectedTab]));
    };

    const onTabChange = (forceNextCycle: boolean = false) => {
        const updatedPets = dataManager.updatePetsState(pets, selectedTab, forceNextCycle);

        setPets(updatedPets);
        setTextAndImage(dataManager.getTextAndImage(selectedPet));
    };

    useEffect(onTabChange, [selectedTab]);

    useEffect(
        () => setTextAndImage(dataManager.getTextAndImage(pets[selectedTab])),
        [hasLoaded]
    );

    useEffect(() => {
        if (interteractionSelection === null) return;

        const interactionTextAndImage = dataManager.getTextAndImageFromInteraction(
            interteractionSelection.type,
            interteractionSelection.interaction,
            selectedPet
        );

        setTextAndImage(interactionTextAndImage);
    }, [interteractionSelection]);

    const mainContent = isDiscovered && textAndImage.image !== null
        ? <PetDiscovered
            selectedPet={selectedPet}
            selectedTab={selectedTab}
            text={textAndImage.text}
            image={textAndImage.image}
        />
        : <Discover
            dataManager={dataManager}
            selectedPet={selectedPet}
            selectedTab={selectedTab}
            discoverPet={discoverPet}
            onDistanceUpdate={distance => setDistanceToPet(distance)}
        />;

    return <div style={{
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: `linear-gradient(180deg, ${COLORS.surface} 0px, transparent 7.5px)`
    }}>
        {mainContent}

        {debugMenuButtonUi(() => setIsDebugMenuOpen(true))}

        <DebugMenu
            isOpen={isDebugMenuOpen}
            onClose={() => setIsDebugMenuOpen(false)}
            discoverPet={discoverPet}
            petsDebugger={petsDebugger}
            selectedPet={selectedPet}
            forceNextCycle={() => onTabChange(true)}
            setHighFriendship={() => onTabChange()}
        />
    </div>;
};

function debugMenuButtonUi(onDebugMenuButtonClicked: () => void): JSX.Element {
    if (!SHOW_DEBUG_MENU_BUTTON) return <></>;

    return <div style={{ position: 'absolute', top: '60px', right: '5px' }}>
        <Button fontScale={0.8} onClick={onDebugMenuButtonClicked}>Debug</Button>
    </div>;
}

export default PetContent;
