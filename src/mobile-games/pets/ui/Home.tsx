import "../css/font.css";
import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Scaffold from "../../../util/ui/Scaffold";
import Button from "../../../util/ui/Button";
import TextReveal from "./TextReveal";
import { PetsDatabase } from "../logic/PetsDatabase";
import { getDefaultPets, discoverPetInDatabase, updatePetsFromSave, updatePetsState, distanceAndDirectionHandler, getTextAndImage, PetTextAndImage, handleInteraction, areInteractionsEnabled } from "../logic/DataManagement";
import { Pet } from "../data/Pet";
import DebugMenu from "./DebugMenu";
import { PetsDebugger } from "../logic/PetsDebugger";
import Footer from "./Footer";
import { createLocationService } from "../../../util/geolocation/LocationService";
import { createNavigator, DistanceAndDirection } from "../../../util/geolocation/Navigator";
import PawIcon from "../icons/paw.svg";
import ArrowIcon from "../icons/arrow.png";
import { Interactions, Interaction } from "../data/Interaction";
import { createCompass } from "../../../util/geolocation/Compass";

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
    const navigator = useRef(createNavigator(createLocationService()));
    const [heading, setHeading] = useState<number | null>(null);
    const compass = useRef(createCompass(updatedHeading => setHeading(updatedHeading)));
    const [pets, setPets] = useState(getDefaultPets());
    const [selectedTab, setSelectedTab] = useState(0);
    const [textAndImage, setTextAndImage] = useState<PetTextAndImage>({ text: null, image: null });
    const [distanceAndDirection, setDistanceAndDirection] = useState<DistanceAndDirection | null>(null);
    const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);

    const selectedPet = pets[selectedTab];

    const discoverPet = () => {
        const updatedPet = discoverPetInDatabase(database, selectedTab);

        pets[selectedTab] = {
            ...pets[selectedTab],
            ...updatedPet
        };

        setPets([...pets]);
        setTextAndImage(getTextAndImage(pets[selectedTab]));
    };

    const updateDistanceAndDirection = () => {
        setDistanceAndDirection(null);

        distanceAndDirectionHandler(
            pets[selectedTab],
            navigator.current,
            discoverPet,
            calculatedDistanceAndDirection => setDistanceAndDirection(calculatedDistanceAndDirection)
        );
    };

    const onTabChange = (forceNextCycle: boolean = false) => {
        updateDistanceAndDirection();
        const updatedPets = updatePetsState(database, pets, selectedTab, forceNextCycle);
        setPets(updatedPets);
        setTextAndImage(getTextAndImage(selectedPet));
    };

    useEffect(() => {
        updateRoute(Route.PETS);

        updatePetsFromSave(database, pets).then(updatedPets => {
            const updatedPetStates = updatePetsState(database, updatedPets, selectedTab);
            setPets(updatedPetStates);
            setTextAndImage(getTextAndImage(updatedPetStates[selectedTab]));
        });

        updateDistanceAndDirection();

        compass.current.start();

        return () => compass.current.stop();
    }, []);

    useEffect(onTabChange, [selectedTab]);

    const onInteractionSelected = (type: keyof Interactions, interaction: Interaction) => {
        const interactionTextAndImage = handleInteraction(type, interaction, selectedPet, database);
        setTextAndImage(interactionTextAndImage);
    };

    const isDiscovered = selectedPet.discovered;

    return <Scaffold
        header={headerUi(pets, selectedTab, index => setSelectedTab(index))}
        footer={<Footer
            selectedTab={selectedTab}
            interactionsEnabled={areInteractionsEnabled(selectedPet)}
            distance={distanceAndDirection?.distance ?? null}
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
            {imageUi(isDiscovered, textAndImage.image, heading)}
            {locatorUi(isDiscovered, distanceAndDirection)}
            <div style={{ position: 'absolute', top: '2px', right: '2px' }}>
                <Button fontScale={0.8} onClick={() => setIsDebugMenuOpen(true)}>Debug</Button>
            </div>
            {textBubbleUi(textAndImage.text)}
        </div>

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

function imageUi(isDiscovered: boolean, image: string | null, heading: number | null): JSX.Element {
    if (isDiscovered && image !== null) {
        return <img
            src={image}
            alt=''
            style={{ maxWidth: '100%', maxHeight: '100%', maskImage: 'radial-gradient(circle, black 60%, transparent 75%)' }}
        />;
    } else {
        const rotation = heading ?? 0;

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
}

function textBubbleUi(text: string | null): JSX.Element {
    return <div style={{
        position: 'absolute',
        bottom: '0',
        width: 'calc(100% - 15px)',
        minHeight: '2.5em',
        margin: '7.5px',
        border: `3px solid ${COLORS.secondary}`,
        borderRadius: '25px',
        padding: '10px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        boxSizing: 'border-box',
        fontFamily: 'Pet',
        fontSize: '1.2em'
    }}>
        <TextReveal>
            {text ?? ''}
        </TextReveal>
    </div>;
}

function locatorUi(isDiscovered: boolean, distanceAndDirection: DistanceAndDirection | null): JSX.Element {
    if (isDiscovered) return <></>;

    const content = distanceAndDirection === null
        ? <div>( ... locating pet ... )</div>
        : <div>Direction: {distanceAndDirection.direction}</div>;

    return <div style={{ position: 'absolute', top: '5px', left: '5px' }}>
        {content}
    </div>;
}

function headerUi(pets: Pet[], selectedTab: number, onTabSelected: (index: number) => void): JSX.Element {
    const tabs = pets.map((pet, index) => {
        const borderStyle = getTabBorderStyle(selectedTab, index);

        const name = pet.discovered ? pet.name : '???';

        return <div
            key={index}
            style={{ ...borderStyle, padding: '7.5px', userSelect: 'none', flex: '0 0 4em', textAlign: 'center' }}
            onClick={() => onTabSelected(index)}
        >
            {name}
        </div>;
    });

    return <div style={{ display: 'flex', overflow: 'auto', backgroundColor: COLORS.surface }}>
        {tabs}
    </div>;
}

function getTabBorderStyle(selectedTab: number, tabIndex: number): React.CSSProperties {
    const border = '2px solid white';

    if (tabIndex === selectedTab) {
        return {
            borderTop: border,
            background: `linear-gradient(0deg, ${COLORS.surface}, ${COLORS.primary})`
        };
    } else if (tabIndex === selectedTab - 1) {
        return {
            border: border,
            borderBottomRightRadius: '15px',
            backgroundClip: 'border-box'
        };
    } else if (tabIndex === selectedTab + 1) {
        return {
            border: border,
            borderBottomLeftRadius: '15px'
        };
    }

    return {
        border: border
    };
}

export default Home;
