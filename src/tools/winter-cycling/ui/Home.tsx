import { useEffect, useRef, useState } from "react";
import Tabs from "./Tabs";
import Content from "./Content";
import { createStorer, StorageKey } from "../../../util/Storage";
import { createDefaultSave, Save, Rider, DistanceUnit, TemperatureUnit, ServerEnv } from "../data/Save";
import { Ride } from "../data/Ride";
import { WinterCyclingNetworking } from "../logic/WinterCyclingNetworking";
import { toKilometers, toCelsius } from "../logic/Converter";

interface HomeProps {
    networking: WinterCyclingNetworking;
}

export enum SubmissionStatus {
    IDLE, SUBMITTING, SUCCESS
}

export enum Tab {
    SUBMISSION, LEADERBOARD, LOG, SETTINGS
}

const TAB_ICONS = ['🚴', '🏅', '🗒️', '⚙️'];

const Home: React.FC<HomeProps> = ({ networking }) => {
    const storer = useRef(createStorer<Save>(StorageKey.WINTER_CYCLING)).current;

    const [save, setSave] = useState(storer.loadSync() ?? createDefaultSave());
    const [selectedTab, setSelectedTab] = useState(0);
    const [submissionStatus, setSubmissionStatus] = useState(SubmissionStatus.IDLE);
    const [rides, setRides] = useState<Ride[] | null>(null);

    useEffect(() => {
        networking.setEnvironment(save.serverEnv ?? ServerEnv.DEVELOPMENT).then(fetchedRides => {
            setRides(fetchedRides);
        });
    }, []);

    const handleSubmit = (rider: Rider, distance: number, temperature: number) => {
        setSubmissionStatus(SubmissionStatus.SUBMITTING);

        const distanceValue = save.distanceUnit === DistanceUnit.MILE ? toKilometers(distance) : distance;
        const temperatureValue = save.temperatureUnit === TemperatureUnit.FAHRENHEIT ? toCelsius(temperature) : temperature;

        const ride: Ride = { rider, distance: distanceValue, temperature: temperatureValue, date: Date.now() };

        setSubmissionStatus(SubmissionStatus.SUBMITTING);

        networking.submitRide(ride).then(updatedRides => {
            setRides(updatedRides);
            setSubmissionStatus(SubmissionStatus.SUCCESS);
        });
    };

    return <div style={{ display: 'flex', height: '100dvh', flexDirection: 'column' }}>
        <Tabs tabs={TAB_ICONS} selectedTabIndex={selectedTab} onTabSelected={index => setSelectedTab(index)} fontScale={1.5} />

        <div style={{ flexGrow: 1, overflow: 'auto' }}>
            <Content
                rides={rides}
                selectedTab={selectedTab}
                save={save}
                onSaveChange={newSave => {
                    if (newSave.serverEnv !== save.serverEnv) {
                        setRides(null);

                        networking.setEnvironment(newSave.serverEnv!).then(fetchedRides => {
                            setRides(fetchedRides);
                        });
                    }

                    storer.save(newSave);
                    setSave(newSave);
                }}
                onSubmit={handleSubmit}
                submissionStatus={submissionStatus}
                resetSubmissionStatus={() => setSubmissionStatus(SubmissionStatus.IDLE)}
                refresh={() => {
                    setRides(null);

                    networking.getRides().then(fetchedRides => {
                        setRides(fetchedRides);
                    });
                }}
            />
        </div>
    </div>;
};

export default Home;
