import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { createCompass, getDirection } from "../../../util/geolocation/Compass";

const Home: React.FC = () => {
    const [heading, setHeading] = useState<number | null>(null);
    const compass = useRef(createCompass(updatedHeading => setHeading(updatedHeading)));

    useEffect(() => {
        updateRoute(Route.TODDLER_TREASURE_HUNT);

        compass.current.start();

        return () => compass.current.stop();
    }, []);

    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', fontSize: '1.5em' }}>
        <div style={{ fontSize: '1.25em', fontWeight: 'bold', marginBottom: '25px' }}>Toddler Treasure Hunt</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', width: '250px' }}>
            <div>Heading:</div>
            <div>{heading !== null ? `${heading.toFixed(0)}°` : '(unknown)'}</div>
            <div>Direction:</div>
            <div>{heading !== null ? `${getDirection(heading)}` : '(unknown)'}</div>
        </div>
    </div>;
};

export default Home;
