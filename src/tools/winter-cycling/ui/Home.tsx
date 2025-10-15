import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Tabs from "./Tabs";
import Content from "./Content";
import { createStorer, StorageKey } from "../../../util/Storage";
import { createDefaultSave, Save } from "../data/Save";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    const storer = useRef(createStorer<Save>(StorageKey.WINTER_CYCLING)).current;

    const [save, setSave] = useState(storer.loadSync() ?? createDefaultSave());
    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() => {
        updateRoute(Route.WINTER_CYCLING);
    }, []);

    return <div style={{ display: 'flex', height: '100dvh', flexDirection: 'column' }}>
        <Tabs selectedTab={selectedTab} onTabSelected={index => setSelectedTab(index)} />
        <div style={{ flexGrow: 1 }}>
            <Content selectedTab={selectedTab} save={save} onSaveChange={newSave => {
                storer.save(newSave);
                setSave(newSave);
            }} />
        </div>
    </div>;
};

export default Home;
