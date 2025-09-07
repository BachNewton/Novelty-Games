import { useEffect, useRef } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { MonopolyState } from "../data/MonopolyState";
import Monopoly from "./Monopoly";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    useEffect(() => updateRoute(Route.MONOPOLY), []);

    const state = useRef<MonopolyState>({
        board: [
            // Side 1
            { type: 'other', name: 'Go' },
            { type: 'property', name: 'Mediterranean Avenue', color: 'brown', price: 60 },
            { type: 'other', name: 'Community Chest' },
            { type: 'property', name: 'Baltic Avenue', color: 'brown', price: 60 },
            { type: 'other', name: 'Income Tax' },
            { type: 'property', name: 'Reading Railroad', color: 'railroad', price: 200 },
            { type: 'property', name: 'Oriental Avenue', color: 'lightblue', price: 100 },
            { type: 'other', name: 'Chance' },
            { type: 'property', name: 'Vermont Avenue', color: 'lightblue', price: 100 },
            { type: 'property', name: 'Connecticut Avenue', color: 'lightblue', price: 120 },
            { type: 'other', name: 'Jail / Just Visiting' },

            // Side 2
            { type: 'property', name: 'St. Charles Place', color: 'pink', price: 140 },
            { type: 'property', name: 'Electric Company', color: 'utility', price: 150 },
            { type: 'property', name: 'States Avenue', color: 'pink', price: 140 },
            { type: 'property', name: 'Virginia Avenue', color: 'pink', price: 160 },
            { type: 'property', name: 'Pennsylvania Railroad', color: 'railroad', price: 200 },
            { type: 'property', name: 'St. James Place', color: 'orange', price: 180 },
            { type: 'other', name: 'Community Chest' },
            { type: 'property', name: 'Tennessee Avenue', color: 'orange', price: 180 },
            { type: 'property', name: 'New York Avenue', color: 'orange', price: 200 },
            { type: 'other', name: 'Free Parking' },

            // Side 3
            { type: 'property', name: 'Kentucky Avenue', color: 'red', price: 220 },
            { type: 'other', name: 'Chance' },
            { type: 'property', name: 'Indiana Avenue', color: 'red', price: 220 },
            { type: 'property', name: 'Illinois Avenue', color: 'red', price: 240 },
            { type: 'property', name: 'B. & O. Railroad', color: 'railroad', price: 200 },
            { type: 'property', name: 'Atlantic Avenue', color: 'yellow', price: 260 },
            { type: 'property', name: 'Ventnor Avenue', color: 'yellow', price: 260 },
            { type: 'property', name: 'Water Works', color: 'utility', price: 150 },
            { type: 'property', name: 'Marvin Gardens', color: 'yellow', price: 280 },
            { type: 'other', name: 'Go to Jail' },

            // Side 4
            { type: 'property', name: 'Pacific Avenue', color: 'green', price: 300 },
            { type: 'property', name: 'North Carolina Avenue', color: 'green', price: 300 },
            { type: 'other', name: 'Community Chest' },
            { type: 'property', name: 'Pennsylvania Avenue', color: 'green', price: 320 },
            { type: 'property', name: 'Short Line', color: 'railroad', price: 200 },
            { type: 'other', name: 'Chance' },
            { type: 'property', name: 'Park Place', color: 'darkblue', price: 350 },
            { type: 'other', name: 'Luxury Tax' },
            { type: 'property', name: 'Boardwalk', color: 'darkblue', price: 400 },
        ]
    });

    return <Monopoly state={state.current} />;
};

export default Home;
