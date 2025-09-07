import { useEffect } from "react";
import { Route, updateRoute } from "../../../ui/Routing";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    useEffect(() => updateRoute(Route.MONOPOLY), []);

    return <div>Monopoly</div>;
};

export default Home;
