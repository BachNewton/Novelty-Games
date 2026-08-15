import PawIcon from "../icons/paw.svg";
import ArrowIcon from "../icons/arrow.png";
import { COLORS } from "./Home";
import { useEffect, useRef, useState } from "react";
import { createLocationService, Location } from "../../../util/geolocation/LocationService";
import { createCompass } from "../../../util/geolocation/Compass";
import { DataManager } from "../logic/DataManager";
import { DistanceAndBearing } from "../../../util/geolocation/Navigator";
import { Pet } from "../data/Pet";
import { PET_DATA_MAP } from "../data/PetData";
import SpeechBubble from "./SpeechBubble";

interface DiscoverProps {
    dataManager: DataManager;
    selectedPet: Pet;
    selectedTab: number;
    hiddenText: string;
    discoverPet: () => void;
    onDistanceUpdate: (distance: number) => void;
}

const Discover: React.FC<DiscoverProps> = ({ dataManager, selectedPet, selectedTab, hiddenText, discoverPet, onDistanceUpdate }) => {
    const locationService = useRef(createLocationService());
    const [heading, setHeading] = useState<number | null>(null);
    const compass = useRef(createCompass(updatedHeading => setHeading(updatedHeading)));
    const [distanceAndBearing, setDistanceAndBearing] = useState<DistanceAndBearing | null>(null);
    const [location, setLocation] = useState<Location | null>(null);

    useEffect(() => {
        locationService.current.watchLocation();
        locationService.current.setLocationListener(updatedLocation => setLocation(updatedLocation));

        compass.current.start();

        return () => {
            locationService.current.stopWatching();

            compass.current.stop();
        };
    }, []);

    const onLocationUpdate = () => {
        dataManager.handleUpdatedLocation(
            selectedPet,
            location,
            discoverPet,
            updatedDistanceAndBearing => {
                setDistanceAndBearing(updatedDistanceAndBearing);
                onDistanceUpdate(updatedDistanceAndBearing.distance);
            }
        );
    };

    useEffect(onLocationUpdate, [location, selectedTab]);

    const rotation = dataManager.calculateArrowRotation(heading, distanceAndBearing);

    return <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
    }}>
        {silhouetteUi(selectedPet)}

        <div style={{
            flex: '1 1 auto',
            minHeight: '0',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <img src={ArrowIcon} alt='' style={{
                maxWidth: '70%',
                maxHeight: '100%',
                transform: `rotate(${rotation}deg)`,
                background: `radial-gradient(circle, ${COLORS.surface}, transparent 60%)`,
                padding: '25px',
                boxSizing: 'border-box'
            }} />

            <img src={PawIcon} alt='' style={{ position: 'absolute', maxWidth: '20%', maxHeight: '30%' }} />
        </div>

        <div style={{ flexShrink: 0 }}>
            <SpeechBubble
                text={hiddenText}
                label={`🤫 ${selectedPet.name} is whispering from a hiding spot...`}
                isItalic={true}
                revealKey={selectedTab}
            />
        </div>
    </div>;
};

function silhouetteUi(selectedPet: Pet): JSX.Element {
    const image = PET_DATA_MAP.get(selectedPet.id)?.images.greetLowFriendship;

    if (image === undefined) return <></>;

    return <div style={{
        flex: '0 1 30%',
        minHeight: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(ellipse 35% 90% at center, ${COLORS.surface}, transparent)`
    }}>
        <img src={image} alt='' style={{
            maxWidth: '50%',
            maxHeight: '100%',
            opacity: 0.85,
            filter: 'brightness(0)',
            maskImage: 'radial-gradient(circle, black 60%, transparent 75%)'
        }} />
    </div>;
}

export default Discover;
