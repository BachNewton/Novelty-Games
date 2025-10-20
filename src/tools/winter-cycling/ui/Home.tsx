import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Tabs from "./Tabs";
import Content from "./Content";
import { createStorer, StorageKey } from "../../../util/Storage";
import { createDefaultSave, Save, Rider } from "../data/Save";
import { Ride } from "../data/Ride";
import { WinterCyclingNetworking } from "../logic/WinterCyclingNetworking";

interface HomeProps {
    networking: WinterCyclingNetworking;
}

export enum SubmissionStatus {
    IDLE, SUBMITTING, SUCCESS
}

export enum Tab {
    SUBMISSION, LEADERBOARD, LOG, SETTINGS
}

const Home: React.FC<HomeProps> = ({ networking }) => {
    const storer = useRef(createStorer<Save>(StorageKey.WINTER_CYCLING)).current;

    const [save, setSave] = useState(storer.loadSync() ?? createDefaultSave());
    const [selectedTab, setSelectedTab] = useState(0);
    const [submissionStatus, setSubmissionStatus] = useState(SubmissionStatus.IDLE);
    const [rides, setRides] = useState<Ride[]>([]);

    useEffect(() => {
        updateRoute(Route.WINTER_CYCLING);

        networking.getRides().then(fetchedRides => {
            setRides(fetchedRides);
        });
    }, []);

    const handleSubmit = (rider: Rider, distance: number, temperature: number) => {
        setSubmissionStatus(SubmissionStatus.SUBMITTING);

        const ride: Ride = { rider, distance, temperature, date: Date.now() };

        setSubmissionStatus(SubmissionStatus.SUBMITTING);

        networking.submitRide(ride).then(updatedRides => {
            setRides(updatedRides);
            setSubmissionStatus(SubmissionStatus.SUCCESS);
        });
    };

    return <div style={{ display: 'flex', height: '100dvh', flexDirection: 'column' }}>
        <Tabs selectedTab={selectedTab} onTabSelected={index => setSelectedTab(index)} />

        <div style={{ flexGrow: 1 }}>
            <Content selectedTab={selectedTab} save={save} onSaveChange={newSave => {
                storer.save(newSave);
                setSave(newSave);
            }} onSubmit={handleSubmit} submissionStatus={submissionStatus} />
        </div>
    </div>;
};

export default Home;
