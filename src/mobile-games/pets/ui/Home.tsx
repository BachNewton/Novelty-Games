import "../css/font.css";
import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Scaffold from "../../../util/ui/Scaffold";
import { PetsDatabase } from "../logic/PetsDatabase";
import { PetsDebugger } from "../logic/PetsDebugger";
import Footer from "./Footer";
import { createNavigator } from "../../../util/geolocation/Navigator";
import { Interactions, Interaction } from "../data/Interaction";
import { createDataManager } from "../logic/DataManager";
import Tabs from "./Tabs";
import Welcome from "./Welcome";
import { State } from "../data/PetSave";
import PetContent from "./PetContent";

export const COLORS = {
    primary: ' #FF2D95',
    secondary: ' #00CED1',
    surface: ' #808080'
};

interface HomeProps {
    database: PetsDatabase;
    petsDebugger: PetsDebugger;
}

export interface InteractionSelection {
    type: keyof Interactions;
    interaction: Interaction;
}

const Home: React.FC<HomeProps> = ({ database, petsDebugger }) => {
    const [hasLoaded, setHasLoaded] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const dataManager = useRef(createDataManager(database, createNavigator())).current;
    const [pets, setPets] = useState(dataManager.getDefaultPets());
    const [selectedTab, setSelectedTab] = useState<number | null>(null);
    const [distanceToPet, setDistanceToPet] = useState<number | null>(null);
    const [seenInteractions, setSeenInteractions] = useState(new Set<string>());
    const [interteractionSelection, setInterteractionSelection] = useState<InteractionSelection | null>(null);

    const selectedPet = pets[selectedTab ?? 0];

    useEffect(() => {
        updateRoute(Route.PETS);

        dataManager.getPetsFromSave(pets).then(updatedPets => {
            setHasLoaded(true);

            const updatedPetStates = dataManager.updatePetsState(updatedPets, 0);
            setPets(updatedPetStates);

            // Show the Welcome screen only if the first pet, "Frog", hasn't been discovered yet
            setShowWelcome(!updatedPets[0].discovered);
        });

        database.getSeenInteractions().then(
            savedSeenInteractions => setSeenInteractions(savedSeenInteractions)
        );
    }, []);

    const onInteractionSelected = (type: keyof Interactions, interaction: Interaction) => {
        seenInteractions.add(interaction.id);
        dataManager.handleInteraction(selectedPet, interaction);

        setInterteractionSelection({ type, interaction });
    };

    const content = selectedTab === null
        ? <div style={{ background: `linear-gradient(180deg, ${COLORS.surface} 0px, transparent 7.5px)` }}>Menu</div>
        : <PetContent
            pets={pets}
            selectedPet={selectedPet}
            selectedTab={selectedTab}
            hasLoaded={hasLoaded}
            dataManager={dataManager}
            interteractionSelection={interteractionSelection}
            setPets={setPets}
            setDistanceToPet={distance => setDistanceToPet(distance)}
            petsDebugger={petsDebugger}
        />;

    return <Scaffold
        header={<Tabs
            pets={pets}
            selectedTab={selectedTab}
            onTabSelected={index => setSelectedTab(index)}
        />}

        footer={<Footer
            hasLoaded={hasLoaded}
            selectedTab={selectedTab}
            interactionsEnabled={dataManager.areInteractionsEnabled(selectedPet)}
            interactionsThisCycle={selectedPet.interactionsThisCycle}
            isDiscovered={selectedPet.discovered}
            isSleeping={selectedPet.state === State.ASLEEP}
            distance={distanceToPet}
            seenInteractions={seenInteractions}
            interactionSelected={onInteractionSelected}
        />}

        fontScale={1.35}
    >
        {content}

        <Welcome show={showWelcome} onClose={() => setShowWelcome(false)} />
    </Scaffold>;
};

export default Home;
