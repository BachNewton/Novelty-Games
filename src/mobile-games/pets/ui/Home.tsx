import "../css/font.css";
import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Scaffold from "../../../util/ui/Scaffold";
import Button from "../../../util/ui/Button";
import TextReveal from "./TextReveal";
import { PetsDatabase } from "../logic/PetsDatabase";
import DebugMenu from "./DebugMenu";
import { PetsDebugger } from "../logic/PetsDebugger";
import Footer from "./Footer";
import { createLocationService, Location } from "../../../util/geolocation/LocationService";
import { createNavigator, DistanceAndBearing } from "../../../util/geolocation/Navigator";
import PawIcon from "../icons/paw.svg";
import ArrowIcon from "../icons/arrow.png";
import { Interactions, Interaction } from "../data/Interaction";
import { createCompass } from "../../../util/geolocation/Compass";
import { createDataManager, PetTextAndImage } from "../logic/DataManager";
import Tabs from "./Tabs";
import FriendshipBar from "./FriendshipBar";
import Welcome from "./Welcome";
import { State } from "../data/PetSave";

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
    const locationService = useRef(createLocationService());
    const [hasLoaded, setHasLoaded] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [heading, setHeading] = useState<number | null>(null);
    const compass = useRef(createCompass(updatedHeading => setHeading(updatedHeading)));
    const dataManagerRef = useRef(createDataManager(database, createNavigator()));
    const [pets, setPets] = useState(dataManagerRef.current.getDefaultPets());
    const [selectedTab, setSelectedTab] = useState(0);
    const [textAndImage, setTextAndImage] = useState<PetTextAndImage>({ text: null, image: null });
    const [distanceAndBearing, setDistanceAndBearing] = useState<DistanceAndBearing | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
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

    const onLocationUpdate = () => {
        dataManager.handleUpdatedLocation(
            selectedPet,
            location,
            discoverPet,
            updatedDistanceAndBearing => setDistanceAndBearing(updatedDistanceAndBearing)
        );
    };

    const onTabChange = (forceNextCycle: boolean = false) => {
        const updatedPets = dataManager.updatePetsState(pets, selectedTab, forceNextCycle);
        setPets(updatedPets);
        setTextAndImage(dataManager.getTextAndImage(selectedPet));
        onLocationUpdate();
    };

    useEffect(onLocationUpdate, [location]);

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

        locationService.current.watchLocation();
        locationService.current.setLocationListener(updatedLocation => setLocation(updatedLocation));

        compass.current.start();

        return () => {
            locationService.current.stopWatching();

            compass.current.stop();
        };
    }, []);

    useEffect(onTabChange, [selectedTab]);

    const onInteractionSelected = (type: keyof Interactions, interaction: Interaction) => {
        const interactionTextAndImage = dataManager.handleInteraction(type, interaction, selectedPet);
        database.addSeenInteraction(interaction.id);
        seenInteractions.add(interaction.id);
        setTextAndImage(interactionTextAndImage);
    };

    const isDiscovered = selectedPet.discovered;

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
            isDiscovered={isDiscovered}
            isSleeping={selectedPet.state === State.ASLEEP}
            distance={distanceAndBearing?.distance ?? null}
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
            {imageUi(isDiscovered, textAndImage.image, dataManager.calculateArrowRotation(heading, distanceAndBearing))}
            {debugMenuButtonUi(() => setIsDebugMenuOpen(true))}
            <FriendshipBar isDiscovered={isDiscovered} level={selectedPet.friendship} animationKey={selectedTab} />
            {textBubbleUi(textAndImage.text)}
        </div>

        <Welcome show={showWelcome} onClose={() => setShowWelcome(false)} />

        <DebugMenu
            isOpen={isDebugMenuOpen}
            onClose={() => setIsDebugMenuOpen(false)}
            discoverPet={discoverPet}
            petsDebugger={petsDebugger}
            selectedPet={selectedPet}
            heading={heading}
            distanceAndBearing={distanceAndBearing}
            arrowRotation={dataManager.calculateArrowRotation(heading, distanceAndBearing)}
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

function imageUi(
    isDiscovered: boolean,
    image: string | null,
    rotation: number | null
): JSX.Element {
    if (isDiscovered && image !== null) {
        return petImageUi(image);
    } else {
        return arrowUi(rotation ?? 0);
    }
}

function petImageUi(image: string): JSX.Element {
    return <img
        src={image}
        alt=''
        style={{ maxWidth: '100%', maxHeight: '100%', maskImage: 'radial-gradient(circle, black 60%, transparent 75%)' }}
    />;
}

function arrowUi(rotation: number): JSX.Element {
    return <>
        <img src={ArrowIcon} alt='' style={{
            maxWidth: '70%',
            maxHeight: '70%',
            transform: `rotate(${rotation}deg)`,
            background: `radial-gradient(circle, ${COLORS.surface}, transparent 60%)`,
            padding: '25px',
            boxSizing: 'border-box'
        }} />
        <img src={PawIcon} alt='' style={{ position: 'absolute', maxWidth: '20%', maxHeight: '20%' }} />
    </>;
}

function textBubbleUi(text: string | null): JSX.Element {
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
            {text ?? ''}
        </TextReveal>
    </div>;
}

export default Home;
