import PawIcon from "../icons/paw.svg";
import ArrowIcon from "../icons/arrow.png";
import { COLORS } from "./Home";
import { useEffect, useRef, useState } from "react";
import { createLocationService, Location } from "../../../util/geolocation/LocationService";
import { createCompass } from "../../../util/geolocation/Compass";
import { DataManager } from "../logic/DataManager";
import { DistanceAndBearing } from "../../../util/geolocation/Navigator";
import { Pet } from "../data/Pet";

interface DiscoverProps {
    dataManager: DataManager;
    selectedPet: Pet;
    selectedTab: number;
    discoverPet: () => void;
    onDistanceUpdate: (distance: number) => void;
}

const Discover: React.FC<DiscoverProps> = ({ dataManager, selectedPet, selectedTab, discoverPet, onDistanceUpdate }) => {
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
};

export default Discover;
