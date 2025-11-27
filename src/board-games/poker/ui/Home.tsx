import { useEffect } from "react";
import { Route, updateRoute } from "../../../ui/Routing";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    useEffect(() => {
        updateRoute(Route.POKER);
    }, []);

    return <div>Poker</div>;
};

export default Home;
