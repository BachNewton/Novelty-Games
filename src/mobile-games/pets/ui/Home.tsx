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
import { State } from "../data/PetSave";
import PetContent from "./PetContent";
import Content from "./Content";
import Menu, { MenuOption } from "./Menu";

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
    const dataManager = useRef(createDataManager(database, createNavigator())).current;
    const [pets, setPets] = useState(dataManager.getDefaultPets());
    const [selectedTab, setSelectedTab] = useState<number | null>(null);
    const [distanceToPet, setDistanceToPet] = useState<number | null>(null);
    const [seenInteractions, setSeenInteractions] = useState(new Set<string>());
    const [interteractionSelection, setInterteractionSelection] = useState<InteractionSelection | null>(null);
    const [menuOptionSelection, setMenuOptionSelection] = useState<MenuOption>(MenuOption.WELCOME);

    const selectedPet = pets[selectedTab ?? 0];

    useEffect(() => {
        updateRoute(Route.PETS);

        dataManager.getPetsFromSave(pets).then(updatedPets => {
            setHasLoaded(true);

            const updatedPetStates = dataManager.updatePetsState(updatedPets, 0);
            setPets(updatedPetStates);
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
        ? <Menu selection={menuOptionSelection} />
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
            menuOptionSelected={selection => setMenuOptionSelection(selection)}
        />}

        fontScale={1.35}
    >
        <Content>
            {content}
        </Content>
    </Scaffold>;
};

export default Home;
