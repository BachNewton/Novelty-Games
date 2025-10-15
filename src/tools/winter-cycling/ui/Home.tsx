import { useEffect } from "react";
import { Route, updateRoute } from "../../../ui/Routing";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    useEffect(() => {
        updateRoute(Route.WINTER_CYCLING);
    }, []);

    return <div>winter cycling</div>;
};

export default Home;
