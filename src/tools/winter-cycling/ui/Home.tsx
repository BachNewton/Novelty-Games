import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Tabs from "./Tabs";
import Content from "./Content";
import { createStorer, StorageKey } from "../../../util/Storage";
import { createDefaultSave, Save, Rider } from "../data/Save";
import { NetworkService } from "../../../util/networking/NetworkService";
import { Ride } from "../data/Ride";

interface HomeProps {
    networkService: NetworkService<void>;
}

export enum SubmissionStatus {
    IDLE, SUBMITTING, SUCCESS, ERROR
}

const Home: React.FC<HomeProps> = ({ networkService }) => {
    const storer = useRef(createStorer<Save>(StorageKey.WINTER_CYCLING)).current;

    // networkService.saveFile({
    //     folderName: "temp",
    //     fileName: "temp",
    //     content: "test"
    // });

    networkService.getFile({
        folderName: "rides",
        fileName: "debug-rides.json"
    }).then(response => console.log("GOT FILE", response));

    const [save, setSave] = useState(storer.loadSync() ?? createDefaultSave());
    const [selectedTab, setSelectedTab] = useState(0);
    const [submissionStatus, setSubmissionStatus] = useState(SubmissionStatus.IDLE);
    // const [rides, setRides] = useState<Ride[]>([]);

    useEffect(() => {
        updateRoute(Route.WINTER_CYCLING);
    }, []);

    const handleSubmit = (rider: Rider, distance: number, temperature: number) => {
        setSubmissionStatus(SubmissionStatus.SUBMITTING);

        const ride: Ride = { rider, distance, temperature, date: Date.now() };

        networkService.getFile({
            folderName: 'rides',
            fileName: 'debug-rides.json'
        }).then(response => {
            if (response.isSuccessful) {
                const savedRides: Ride[] = JSON.parse(response.content as string);

                savedRides.push(ride);

                networkService.saveFile({
                    folderName: 'rides',
                    fileName: 'debug-rides.json',
                    content: JSON.stringify(savedRides)
                }).then(saveResponse => {
                    if (saveResponse.isSuccessful) {
                        setSubmissionStatus(SubmissionStatus.SUCCESS);
                    } else {
                        setSubmissionStatus(SubmissionStatus.ERROR);
                    }
                });
            } else {
                const savedRides: Ride[] = [];

                savedRides.push(ride);

                networkService.saveFile({
                    folderName: 'rides',
                    fileName: 'debug-rides.json',
                    content: JSON.stringify(savedRides)
                }).then(saveResponse => {
                    if (saveResponse.isSuccessful) {
                        setSubmissionStatus(SubmissionStatus.SUCCESS);
                    } else {
                        setSubmissionStatus(SubmissionStatus.ERROR);
                    }
                });
            }
        });
    };

    return <div style={{ display: 'flex', height: '100dvh', flexDirection: 'column' }}>
        <Tabs selectedTab={selectedTab} onTabSelected={index => setSelectedTab(index)} />

        <div style={{ flexGrow: 1 }}>
            <Content selectedTab={selectedTab} save={save} onSaveChange={newSave => {
                storer.save(newSave);
                setSave(newSave);
            }} onSubmit={handleSubmit} />
        </div>
    </div>;
};

export default Home;
