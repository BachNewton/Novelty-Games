import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { MonopolyState } from "../data/MonopolyState";
import Monopoly from "./Monopoly";
import { createMonopolyEngine } from "../logic/MonopolyEngine";
import MonopolyCanvas from "./MonopolyCanvas";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    const engine = useRef(createMonopolyEngine()).current;

    const [state, setState] = useState<MonopolyState>({
        board: [
            // Bottom Side
            { type: 'go', name: 'Go' },
            { type: 'street', name: 'Mediterranean Avenue', color: 'brown', price: 60, ownedByPlayerId: null },
            { type: 'community-chest', name: 'Community Chest' },
            { type: 'street', name: 'Baltic Avenue', color: 'brown', price: 60, ownedByPlayerId: null },
            { type: 'tax', name: 'Income Tax', amount: 200 },
            { type: 'railroad', name: 'Reading Railroad', price: 200, ownedByPlayerId: null },
            { type: 'street', name: 'Oriental Avenue', color: 'lightblue', price: 100, ownedByPlayerId: null },
            { type: 'chance', name: 'Chance' },
            { type: 'street', name: 'Vermont Avenue', color: 'lightblue', price: 100, ownedByPlayerId: null },
            { type: 'street', name: 'Connecticut Avenue', color: 'lightblue', price: 120, ownedByPlayerId: null },
            { type: 'jail', name: 'Jail / Just Visiting' },

            // Left Side
            { type: 'street', name: 'St. Charles Place', color: 'pink', price: 140, ownedByPlayerId: null },
            { type: 'electric-utility', name: 'Electric Company', price: 150, ownedByPlayerId: null },
            { type: 'street', name: 'States Avenue', color: 'pink', price: 140, ownedByPlayerId: null },
            { type: 'street', name: 'Virginia Avenue', color: 'pink', price: 160, ownedByPlayerId: null },
            { type: 'railroad', name: 'Pennsylvania Railroad', price: 200, ownedByPlayerId: null },
            { type: 'street', name: 'St. James Place', color: 'orange', price: 180, ownedByPlayerId: null },
            { type: 'community-chest', name: 'Community Chest' },
            { type: 'street', name: 'Tennessee Avenue', color: 'orange', price: 180, ownedByPlayerId: null },
            { type: 'street', name: 'New York Avenue', color: 'orange', price: 200, ownedByPlayerId: null },
            { type: 'free-parking', name: 'Free Parking' },

            // Top Side
            { type: 'street', name: 'Kentucky Avenue', color: 'red', price: 220, ownedByPlayerId: null },
            { type: 'chance', name: 'Chance' },
            { type: 'street', name: 'Indiana Avenue', color: 'red', price: 220, ownedByPlayerId: null },
            { type: 'street', name: 'Illinois Avenue', color: 'red', price: 240, ownedByPlayerId: null },
            { type: 'railroad', name: 'B. & O. Railroad', price: 200, ownedByPlayerId: null },
            { type: 'street', name: 'Atlantic Avenue', color: 'yellow', price: 260, ownedByPlayerId: null },
            { type: 'street', name: 'Ventnor Avenue', color: 'yellow', price: 260, ownedByPlayerId: null },
            { type: 'water-utility', name: 'Water Works', price: 150, ownedByPlayerId: null },
            { type: 'street', name: 'Marvin Gardens', color: 'yellow', price: 280, ownedByPlayerId: null },
            { type: 'go-to-jail', name: 'Go to Jail' },

            // Right Side
            { type: 'street', name: 'Pacific Avenue', color: 'green', price: 300, ownedByPlayerId: null },
            { type: 'street', name: 'North Carolina Avenue', color: 'green', price: 300, ownedByPlayerId: null },
            { type: 'community-chest', name: 'Community Chest' },
            { type: 'street', name: 'Pennsylvania Avenue', color: 'green', price: 320, ownedByPlayerId: null },
            { type: 'railroad', name: 'Short Line', price: 200, ownedByPlayerId: null },
            { type: 'chance', name: 'Chance' },
            { type: 'street', name: 'Park Place', color: 'darkblue', price: 350, ownedByPlayerId: null },
            { type: 'tax', name: 'Luxury Tax', amount: 100 },
            { type: 'street', name: 'Boardwalk', color: 'darkblue', price: 400, ownedByPlayerId: null }
        ],
        players: [
            { id: '1', name: 'Kyle', color: 'blue', position: 0, money: 1500 },
            { id: '1', name: 'Eric', color: 'red', position: 0, money: 1500 },
            { id: '1', name: 'Megan', color: 'yellow', position: 0, money: 1500 },
            { id: '1', name: 'Elliott', color: 'green', position: 0, money: 1500 },
            // { id: '1', name: 'Mom', color: 'purple', position: 0, money: 1500 },
            // { id: '1', name: 'Gary', color: 'cyan', position: 0, money: 1500 },
            // { id: '1', name: 'Grandma', color: 'silver', position: 0, money: 1500 },
            // { id: '1', name: 'James', color: 'orange', position: 0, money: 1500 }
        ],
        phase: { type: 'ready' },
        currentPlayerIndex: 0,
        log: []
    });

    useEffect(() => updateRoute(Route.MONOPOLY), []);

    // return <Monopoly state={state} id={'1'} actions={{
    //     roll: () => setState(engine.roll(state))
    // }} />;

    return <MonopolyCanvas state={state} id={'1'} actions={{
        roll: () => setState(engine.roll(state)),
        buyProperty: () => setState(engine.buyProperty(state)),
    }} />;
};

export default Home;
