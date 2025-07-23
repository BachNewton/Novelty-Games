import { useEffect } from "react";
import { Route, updateRoute } from "../../../ui/Routing";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    useEffect(() => updateRoute(Route.TODDLER_TREASURE_HUNT));

    return <div>
        <div>Toddler Treasure Hunt</div>
    </div>;
};

export default Home;
