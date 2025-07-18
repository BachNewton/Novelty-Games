import { useEffect } from "react";
import { Route, updateRoute } from "../../ui/Routing";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    useEffect(() => {
        updateRoute(Route.PETS);
    }, []);

    return <div>Work in progress</div>;
};

export default Home;
