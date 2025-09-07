import { useEffect, useRef } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { MonopolyState } from "../data/MonopolyState";
import Monopoly from "./Monopoly";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    useEffect(() => updateRoute(Route.MONOPOLY), []);

    const state = useRef<MonopolyState>({
        board: [
            { name: "Go" },
            { name: "Mediterranean Avenue" },
            { name: "Community Chest" },
            { name: "Baltic Avenue" },
            { name: "Income Tax" },
            { name: "Reading Railroad" },
            { name: "Oriental Avenue" },
            { name: "Chance" },
            { name: "Vermont Avenue" },
            { name: "Connecticut Avenue" },
            { name: "Jail / Just Visiting" },
            { name: "St. Charles Place" },
            { name: "Electric Company" },
            { name: "States Avenue" },
            { name: "Virginia Avenue" },
            { name: "Pennsylvania Railroad" },
            { name: "St. James Place" },
            { name: "Community Chest" },
            { name: "Tennessee Avenue" },
            { name: "New York Avenue" },
            { name: "Free Parking" },
            { name: "Kentucky Avenue" },
            { name: "Chance" },
            { name: "Indiana Avenue" },
            { name: "Illinois Avenue" },
            { name: "B. & O. Railroad" },
            { name: "Atlantic Avenue" },
            { name: "Ventnor Avenue" },
            { name: "Water Works" },
            { name: "Marvin Gardens" },
            { name: "Go to Jail" },
            { name: "Pacific Avenue" },
            { name: "North Carolina Avenue" },
            { name: "Community Chest" },
            { name: "Pennsylvania Avenue" },
            { name: "Short Line" },
            { name: "Chance" },
            { name: "Park Place" },
            { name: "Luxury Tax" },
            { name: "Boardwalk" }
        ]
    });

    return <Monopoly state={state.current} />;
};

export default Home;
