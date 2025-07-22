import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../ui/Routing";
import Scaffold from "../../util/ui/Scaffold";
import Button from "../../util/ui/Button";
import PlaceholderImage from "../images/placeholder.png";
import HiddenImage from "../images/hidden.png";
import SleepingImage from "../images/sleeping.png";
import TextReveal from "./TextReveal";
import { LocationService } from "../logic/LocationService";
import { DistanceAndDirection } from "../logic/Navigation";
import { PetsDatabase } from "../logic/PetsDatabase";
import { getDefaultPets, discoverPetInDatabase, updatePetsFromSave, updatePetsState, distanceAndDirectionHandler, getDialogue } from "../logic/DataManagement";
import { Pet } from "../data/Pet";
import { State } from "../data/PetSave";
import DebugMenu from "./DebugMenu";
import { PetsDebugger } from "../logic/PetsDebugger";

const COLORS = {
    primary: ' #FF2D95',
    secondary: ' #00CED1',
    surface: ' #808080'
};

const FOOTER_BUTTONS_SCALE = 1.4;
const FOOTER_BUTTONS_BORDER_RADIUS = 20;

interface HomeProps {
    locationService: LocationService;
    database: PetsDatabase;
    petsDebugger: PetsDebugger;
}

const Home: React.FC<HomeProps> = ({ locationService, database, petsDebugger }) => {
    const [pets, setPets] = useState(getDefaultPets());
    const [selectedTab, setSelectedTab] = useState(0);
    const [distanceAndDirection, setDistanceAndDirection] = useState<DistanceAndDirection | null>(null);
    const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);

    const discoverPet = () => {
        const updatedPet = discoverPetInDatabase(database, selectedTab);

        pets[selectedTab] = {
            ...pets[selectedTab],
            ...updatedPet
        };

        setPets([...pets]);
    };

    const updateDistanceAndDirection = () => {
        setDistanceAndDirection(null);

        distanceAndDirectionHandler(
            pets[selectedTab],
            locationService,
            discoverPet,
            calculatedDistanceAndDirection => setDistanceAndDirection(calculatedDistanceAndDirection)
        );
    };

    const onTabChange = () => {
        updateDistanceAndDirection();
        const updatedPets = updatePetsState(database, pets, selectedTab);
        setPets(updatedPets);
    };

    useEffect(() => {
        updateRoute(Route.PETS);

        updatePetsFromSave(database, pets).then(updatedPets => setPets(updatedPets));

        updateDistanceAndDirection();
    }, []);

    useEffect(onTabChange, [selectedTab]);

    const selectedPet = pets[selectedTab];
    const isDiscovered = selectedPet.discovered;
    const image = getImage(selectedPet);
    const text = getText(selectedPet);

    return <Scaffold
        header={headerUi(pets, selectedTab, index => setSelectedTab(index))}
        footer={footerUi()}
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
            <img src={image} alt='' style={{ maxWidth: '100%', maxHeight: '100%' }} />
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
                    {text}
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

function getImage(pet: Pet): string {
    if (pet.discovered) {
        switch (pet.state) {
            case State.AWAKE:
                return PlaceholderImage;
            case State.ASLEEP:
                return SleepingImage;
        }
    } else {
        return HiddenImage;
    }
}

function getText(pet: Pet): string {
    const dialogue = getDialogue(pet);

    if (pet.discovered) {
        switch (pet.state) {
            case State.AWAKE:
                return dialogue.greeting;
            case State.ASLEEP:
                return dialogue.sleeping;
        }
    } else {
        return dialogue.hidden;
    }
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

function footerUi(): JSX.Element {
    return <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderTop: `4px solid ${COLORS.primary}`,
        padding: '10px',
        backgroundColor: COLORS.surface,
        gap: '10px'
    }}>
        <Button fontScale={FOOTER_BUTTONS_SCALE} borderRadius={FOOTER_BUTTONS_BORDER_RADIUS}>Chat</Button>
        <Button fontScale={FOOTER_BUTTONS_SCALE} borderRadius={FOOTER_BUTTONS_BORDER_RADIUS}>Give Treat</Button>
        <Button fontScale={FOOTER_BUTTONS_SCALE} borderRadius={FOOTER_BUTTONS_BORDER_RADIUS}>Play</Button>
        <Button fontScale={FOOTER_BUTTONS_SCALE} borderRadius={FOOTER_BUTTONS_BORDER_RADIUS}>Pet</Button>
    </div>;
}

export default Home;
