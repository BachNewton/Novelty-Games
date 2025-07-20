import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../ui/Routing";
import Scaffold from "../../util/ui/Scaffold";
import Button from "../../util/ui/Button";
import PlaceholderImage from "../images/placeholder.jpg";
import TextReveal from "./TextReveal";
import { LocationService } from "../logic/LocationService";
import { ALL_PETS } from "../data/Pet";
import { DistanceAndDirection } from "../logic/Navigation";
import { Database } from "../../util/database/v1/Database";
import { PetsTables } from "../../util/database/v1/DatabaseSchemas";

const COLORS = {
    primary: ' #FF2D95',
    secondary: ' #00CED1',
    surface: ' #808080'
};

const petNames = ['PetNameOne', 'PetNameTwo', 'PetNameThree', 'PetNameFour', 'PetNameFive', 'PetNameSix', 'PetNameSeven'];

interface HomeProps {
    locationService: LocationService;
    database: Database<PetsTables>;
}

const Home: React.FC<HomeProps> = ({ locationService, database }) => {
    const [distanceAndDirection, setDistanceAndDirection] = useState<DistanceAndDirection | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);

    const updateDistanceAndDirection = () => {
        locationService.calculateDistanceAndDirectionTo(ALL_PETS[selectedTab].location).then(calculatedDistanceAndDirection => {
            setDistanceAndDirection(calculatedDistanceAndDirection);
        });
    };

    useEffect(() => {
        updateRoute(Route.PETS);

        database.getAll('pets').then(pets => console.log('Saved pets:', pets));

        updateDistanceAndDirection();
    }, []);

    useEffect(updateDistanceAndDirection, [selectedTab]);

    return <Scaffold
        header={headerUi(selectedTab, index => setSelectedTab(index))}
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
            <img src={PlaceholderImage} alt='' style={{ maxWidth: '100%', maxHeight: '100%' }} />
            <div style={{ position: 'absolute', top: '5px', left: '5px' }}>
                <div>Distance: {distanceAndDirection?.distance?.toFixed(3)} km</div>
                <div>Direction: {distanceAndDirection?.direction}</div>
            </div>
            <div style={{
                position: 'absolute',
                bottom: '0px',
                left: '0px',
                margin: '7.5px',
                border: `3px solid ${COLORS.secondary}`,
                borderRadius: '25px',
                padding: '10px',
                backgroundColor: 'rgba(0,0,0,0.6)'
            }}>
                <TextReveal>
                    Hello, I am a pet. This is my dialogue. This game is a work in progress. In the future I will say some really cute things.
                    Right now you can greet me, pet me, or feed me. But these are just some placeholder options and they don't do anything.
                </TextReveal>
            </div>
        </div>
    </Scaffold >;
};

function headerUi(selectedTab: number, onTabSelected: (index: number) => void): JSX.Element {
    const tabs = petNames.map((petName, index) => {
        const borderStyle = getTabBorderStyle(selectedTab, index);

        return <div
            key={index}
            style={{ ...borderStyle, padding: '7.5px', userSelect: 'none' }}
            onClick={() => onTabSelected(index)}
        >
            {petName}
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
        borderTop: `3px solid ${COLORS.primary}`,
        padding: '5px',
        backgroundColor: COLORS.surface
    }}>
        <Button>Greet</Button>
        <Button>Pet</Button>
        <Button>Feed</Button>
        <Button>Play</Button>
    </div>;
}

export default Home;
