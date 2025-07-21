import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../ui/Routing";
import Scaffold from "../../util/ui/Scaffold";
import Button from "../../util/ui/Button";
import PlaceholderImage from "../images/placeholder.png";
import HiddenImage from "../images/hidden.png";
import TextReveal from "./TextReveal";
import { LocationService } from "../logic/LocationService";
import { PET_DATA } from "../data/PetData";
import { DistanceAndDirection } from "../logic/Navigation";
import { createID } from "../../util/ID";
import { PetsDatabase } from "../logic/PetsDatabase";
import { getDefaultPets, discoverPetInDatabase } from "../logic/DataManagement";
import { Pet } from "../data/Pet";

const COLORS = {
    primary: ' #FF2D95',
    secondary: ' #00CED1',
    surface: ' #808080'
};

const DISCOVERY_THRESHOLD = 0.075; // 75 meters

interface HomeProps {
    locationService: LocationService;
    database: PetsDatabase;
}

const Home: React.FC<HomeProps> = ({ locationService, database }) => {
    const [pets, setPets] = useState(getDefaultPets());
    const [distanceAndDirection, setDistanceAndDirection] = useState<DistanceAndDirection | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);

    const discoverPet = () => {
        discoverPetInDatabase(database, selectedTab);
        pets[selectedTab].discovered = true;
        setPets([...pets]);
    };

    const updateDistanceAndDirection = () => {
        setDistanceAndDirection(null);

        locationService.calculateDistanceAndDirectionTo(PET_DATA[selectedTab].location).then(calculatedDistanceAndDirection => {
            if (calculatedDistanceAndDirection.distance < DISCOVERY_THRESHOLD) {
                discoverPet();
            } else {
                setDistanceAndDirection(calculatedDistanceAndDirection);
            }
        });
    };

    useEffect(() => {
        updateRoute(Route.PETS);

        console.log(createID()); // For debugging

        database.getPets().then(savedPets => {
            console.log('Saved pets:', savedPets);

            const updatedPets = pets.map<Pet>(pet => {
                if (savedPets.has(pet.id)) {
                    const petSave = savedPets.get(pet.id)!;

                    return {
                        ...pet,
                        ...petSave
                    };
                }

                return pet;
            });

            setPets(updatedPets);
        });

        updateDistanceAndDirection();
    }, []);

    useEffect(updateDistanceAndDirection, [selectedTab]);

    const isDiscovered = pets[selectedTab].discovered;
    const image = isDiscovered ? PlaceholderImage : HiddenImage;
    const text = isDiscovered
        ? 'Hello, I am a pet. This is my dialogue. This game is a work in progress. In the future I will say some really cute things. Right now you can greet me, pet me, or feed me. But these are just some placeholder options and they don\'t do anything.'
        : 'I am a pet and I am hidden. Come find me!'
    const locationElement = isDiscovered
        ? <div style={{ position: 'absolute', top: '5px', left: '5px' }}>
            <div>Distance: {formatDistance(distanceAndDirection)}</div>
            <div>Direction: {distanceAndDirection?.direction ?? '(unknonwn)'}</div>
        </div>
        : <></>;


    return <Scaffold
        header={headerUi(pets, selectedTab, index => setSelectedTab(index))}
        footer={footerUi(discoverPet)}
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
            {locationElement}
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
    </Scaffold >;
};

function formatDistance(distanceAndDirection: DistanceAndDirection | null): string {
    if (distanceAndDirection === null) return '(unknown)';

    const distance = distanceAndDirection.distance;

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

function footerUi(discoverPet: () => void): JSX.Element {
    return <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderTop: `3px solid ${COLORS.primary}`,
        padding: '5px',
        backgroundColor: COLORS.surface
    }}>
        <Button>Greet</Button>
        <Button>Pet</Button>
        <Button>Feed</Button>
        <Button>Play</Button>
        <Button fontScale={0.75} onClick={discoverPet}>Debug: discoverPet</Button>
    </div>;
}

export default Home;
