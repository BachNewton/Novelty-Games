import "../css/font.css";
import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Scaffold from "../../../util/ui/Scaffold";
import Button from "../../../util/ui/Button";
import { PetsDatabase } from "../logic/PetsDatabase";
import DebugMenu from "./DebugMenu";
import { PetsDebugger } from "../logic/PetsDebugger";
import Footer from "./Footer";
import { createNavigator } from "../../../util/geolocation/Navigator";
import { Interactions, Interaction } from "../data/Interaction";
import { createDataManager, PetTextAndImage } from "../logic/DataManager";
import Tabs from "./Tabs";
import Welcome from "./Welcome";
import { State } from "../data/PetSave";
import Discover from "./Discover";
import PetContent from "./PetContent";

const SHOW_DEBUG_MENU_BUTTON = true;

export const COLORS = {
    primary: ' #FF2D95',
    secondary: ' #00CED1',
    surface: ' #808080'
};

interface HomeProps {
    database: PetsDatabase;
    petsDebugger: PetsDebugger;
}

const Home: React.FC<HomeProps> = ({ database, petsDebugger }) => {
    const [hasLoaded, setHasLoaded] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const dataManagerRef = useRef(createDataManager(database, createNavigator()));
    const [pets, setPets] = useState(dataManagerRef.current.getDefaultPets());
    const [selectedTab, setSelectedTab] = useState(0);
    const [textAndImage, setTextAndImage] = useState<PetTextAndImage>({ text: '', image: null });
    const [distanceToPet, setDistanceToPet] = useState<number | null>(null);
    const [seenInteractions, setSeenInteractions] = useState(new Set<string>());
    const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);

    const selectedPet = pets[selectedTab];
    const dataManager = dataManagerRef.current;

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

    useEffect(() => {
        updateRoute(Route.PETS);

        dataManager.getPetsFromSave(pets).then(updatedPets => {
            setHasLoaded(true);

            const updatedPetStates = dataManager.updatePetsState(updatedPets, selectedTab);
            setPets(updatedPetStates);
            setTextAndImage(dataManager.getTextAndImage(updatedPetStates[selectedTab]));

            // Show the Welcome screen only if the first pet, "Frog", hasn't been discovered yet
            setShowWelcome(!updatedPets[0].discovered);
        });

        database.getSeenInteractions().then(savedSeenInteractions => setSeenInteractions(savedSeenInteractions));
    }, []);

    useEffect(onTabChange, [selectedTab]);

    const onInteractionSelected = (type: keyof Interactions, interaction: Interaction) => {
        const interactionTextAndImage = dataManager.handleInteraction(type, interaction, selectedPet);
        database.addSeenInteraction(interaction.id);
        seenInteractions.add(interaction.id);
        setTextAndImage(interactionTextAndImage);
    };

    const isDiscovered = selectedPet.discovered;

    const mainContent = isDiscovered && textAndImage.image !== null
        ? <PetContent
            pets={pets}
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

    return <Scaffold
        header={<Tabs
            pets={pets}
            selectedTab={selectedTab}
            onTabSelected={index => setSelectedTab(index ?? 0)}
        />}

        footer={<Footer
            hasLoaded={hasLoaded}
            selectedTab={selectedTab}
            interactionsEnabled={dataManager.areInteractionsEnabled(selectedPet)}
            interactionsThisCycle={selectedPet.interactionsThisCycle}
            isDiscovered={isDiscovered}
            isSleeping={selectedPet.state === State.ASLEEP}
            distance={distanceToPet}
            seenInteractions={seenInteractions}
            interactionSelected={onInteractionSelected}
        />}

        fontScale={1.35}
    >
        <div style={{
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: `linear-gradient(180deg, ${COLORS.surface} 0px, transparent 7.5px)`
        }}>
            {mainContent}
            {debugMenuButtonUi(() => setIsDebugMenuOpen(true))}
        </div>

        <Welcome show={showWelcome} onClose={() => setShowWelcome(false)} />

        <DebugMenu
            isOpen={isDebugMenuOpen}
            onClose={() => setIsDebugMenuOpen(false)}
            discoverPet={discoverPet}
            petsDebugger={petsDebugger}
            selectedPet={selectedPet}
            forceNextCycle={() => onTabChange(true)}
            setHighFriendship={() => onTabChange()}
        />
    </Scaffold>;
};

function debugMenuButtonUi(onDebugMenuButtonClicked: () => void): JSX.Element {
    if (!SHOW_DEBUG_MENU_BUTTON) return <></>;

    return <div style={{ position: 'absolute', top: '60px', right: '5px' }}>
        <Button fontScale={0.8} onClick={onDebugMenuButtonClicked}>Debug</Button>
    </div>;
}

export default Home;
