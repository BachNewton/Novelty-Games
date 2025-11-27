import { useEffect, useRef } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { createPokerNetworking } from "../logic/PokerNetworking";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    const networking = useRef(createPokerNetworking()).current;

    useEffect(() => {
        updateRoute(Route.POKER);
    }, []);

    return <div>Poker</div>;
};

export default Home;
