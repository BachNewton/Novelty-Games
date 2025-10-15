import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Tabs from "./Tabs";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() => {
        updateRoute(Route.WINTER_CYCLING);
    }, []);

    return <div style={{ display: 'flex', height: '100dvh', flexDirection: 'column' }}>
        <Tabs selectedTab={selectedTab} onTabSelected={index => setSelectedTab(index)} />
        <div style={{ flexGrow: 1 }}>Content</div>
    </div>;
};

export default Home;
