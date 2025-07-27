import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Scaffold from "../../../util/ui/Scaffold";
import Button from "../../../util/ui/Button";
import TextReveal from "./TextReveal";
import { PetsDatabase } from "../logic/PetsDatabase";
import { getDefaultPets, discoverPetInDatabase, updatePetsFromSave, updatePetsState, distanceAndDirectionHandler, getTextAndImage, PetTextAndImage, handleInteraction } from "../logic/DataManagement";
import { Pet } from "../data/Pet";
import DebugMenu from "./DebugMenu";
import { PetsDebugger } from "../logic/PetsDebugger";
import Footer from "./Footer";
import { createLocationService } from "../../../util/geolocation/LocationService";
import { createNavigator, DistanceAndDirection } from "../../../util/geolocation/Navigator";
import HiddenImage from "../images/hidden.png";
import { Interactions, Interaction } from "../data/Interaction";
import { State } from "../data/PetSave";

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
    const [pets, setPets] = useState(getDefaultPets());
    const [selectedTab, setSelectedTab] = useState(0);
    const [textAndImage, setTextAndImage] = useState<PetTextAndImage>({ text: '', image: HiddenImage });
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

    const onTabChange = () => {
        updateDistanceAndDirection();
        const updatedPets = updatePetsState(database, pets, selectedTab);
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
            interactionsEnabled={selectedPet.discovered && selectedPet.state === State.AWAKE}
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
            <img src={textAndImage.image} alt='' style={{ maxWidth: '100%', maxHeight: '100%' }} />
            {locatorUi(isDiscovered, distanceAndDirection)}
            <div style={{ position: 'absolute', top: '2px', right: '2px' }}>
                <Button fontScale={0.8} onClick={() => setIsDebugMenuOpen(true)}>Debug</Button>
            </div>
            <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                margin: '7.5px',
                border: `3px solid ${COLORS.secondary}`,
                borderRadius: '25px',
                padding: '10px',
                backgroundColor: 'rgba(0,0,0,0.6)'
            }}>
                <TextReveal>
                    {textAndImage.text}
                </TextReveal>
            </div>
        </div>

        <DebugMenu
            isOpen={isDebugMenuOpen}
            onClose={() => setIsDebugMenuOpen(false)}
            discoverPet={discoverPet}
            petsDebugger={petsDebugger}
            selectedPet={selectedPet}
        />
    </Scaffold>;
};

function locatorUi(isDiscovered: boolean, distanceAndDirection: DistanceAndDirection | null): JSX.Element {
    if (isDiscovered) return <></>;

    const content = distanceAndDirection === null
        ? <div>( ... locating pet ... )</div>
        : <>
            <div>Distance: {formatDistance(distanceAndDirection.distance)}</div>
            <div>Direction: {distanceAndDirection.direction}</div>
        </>;

    return <div style={{ position: 'absolute', top: '5px', left: '5px' }}>
        {content}
    </div>;
}

function formatDistance(distance: number): string {
    if (distance < 1) return (distance * 1000).toFixed(0) + ' m';
    return distance.toFixed(3) + ' km';
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
