import { useEffect, useRef } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { MonopolyState } from "../data/MonopolyState";
import Monopoly from "./Monopoly";
import { Side } from "../data/Square";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    useEffect(() => updateRoute(Route.MONOPOLY), []);

    const state = useRef<MonopolyState>({
        board: [
            // Bottom Side
            { type: 'go', name: 'Go', side: Side.BOTTOM },
            { type: 'street', name: 'Mediterranean Avenue', side: Side.BOTTOM, color: 'brown', price: 60 },
            { type: 'community-chest', name: 'Community Chest', side: Side.BOTTOM },
            { type: 'street', name: 'Baltic Avenue', side: Side.BOTTOM, color: 'brown', price: 60 },
            { type: 'tax', name: 'Income Tax', side: Side.BOTTOM, amount: 200 },
            { type: 'railroad', name: 'Reading Railroad', side: Side.BOTTOM, price: 200 },
            { type: 'street', name: 'Oriental Avenue', side: Side.BOTTOM, color: 'lightblue', price: 100 },
            { type: 'chance', name: 'Chance', side: Side.BOTTOM },
            { type: 'street', name: 'Vermont Avenue', side: Side.BOTTOM, color: 'lightblue', price: 100 },
            { type: 'street', name: 'Connecticut Avenue', side: Side.BOTTOM, color: 'lightblue', price: 120 },
            { type: 'jail', name: 'Jail / Just Visiting', side: Side.BOTTOM },

            // Left Side
            { type: 'street', name: 'St. Charles Place', side: Side.LEFT, color: 'pink', price: 140 },
            { type: 'electric-utility', name: 'Electric Company', side: Side.LEFT, price: 150 },
            { type: 'street', name: 'States Avenue', side: Side.LEFT, color: 'pink', price: 140 },
            { type: 'street', name: 'Virginia Avenue', side: Side.LEFT, color: 'pink', price: 160 },
            { type: 'railroad', name: 'Pennsylvania Railroad', side: Side.LEFT, price: 200 },
            { type: 'street', name: 'St. James Place', side: Side.LEFT, color: 'orange', price: 180 },
            { type: 'community-chest', name: 'Community Chest', side: Side.LEFT },
            { type: 'street', name: 'Tennessee Avenue', side: Side.LEFT, color: 'orange', price: 180 },
            { type: 'street', name: 'New York Avenue', side: Side.LEFT, color: 'orange', price: 200 },
            { type: 'free-parking', name: 'Free Parking', side: Side.LEFT },

            // Top Side
            { type: 'street', name: 'Kentucky Avenue', side: Side.TOP, color: 'red', price: 220 },
            { type: 'chance', name: 'Chance', side: Side.TOP },
            { type: 'street', name: 'Indiana Avenue', side: Side.TOP, color: 'red', price: 220 },
            { type: 'street', name: 'Illinois Avenue', side: Side.TOP, color: 'red', price: 240 },
            { type: 'railroad', name: 'B. & O. Railroad', side: Side.TOP, price: 200 },
            { type: 'street', name: 'Atlantic Avenue', side: Side.TOP, color: 'yellow', price: 260 },
            { type: 'street', name: 'Ventnor Avenue', side: Side.TOP, color: 'yellow', price: 260 },
            { type: 'water-utility', name: 'Water Works', side: Side.TOP, price: 150 },
            { type: 'street', name: 'Marvin Gardens', side: Side.TOP, color: 'yellow', price: 280 },
            { type: 'go-to-jail', name: 'Go to Jail', side: Side.TOP },

            // Right Side
            { type: 'street', name: 'Pacific Avenue', side: Side.RIGHT, color: 'green', price: 300 },
            { type: 'street', name: 'North Carolina Avenue', side: Side.RIGHT, color: 'green', price: 300 },
            { type: 'community-chest', name: 'Community Chest', side: Side.RIGHT },
            { type: 'street', name: 'Pennsylvania Avenue', side: Side.RIGHT, color: 'green', price: 320 },
            { type: 'railroad', name: 'Short Line', side: Side.RIGHT, price: 200 },
            { type: 'chance', name: 'Chance', side: Side.RIGHT },
            { type: 'street', name: 'Park Place', side: Side.RIGHT, color: 'darkblue', price: 350 },
            { type: 'tax', name: 'Luxury Tax', side: Side.RIGHT, amount: 100 },
            { type: 'street', name: 'Boardwalk', side: Side.RIGHT, color: 'darkblue', price: 400 },
        ]
    });

    return <Monopoly state={state.current} />;
};

export default Home;
