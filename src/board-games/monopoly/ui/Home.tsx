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
            { type: 'street', name: 'Mediterranean Avenue', color: 'brown', price: 60, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [2, 10, 30, 90, 160, 250] },
            { type: 'community-chest', name: 'Community Chest' },
            { type: 'street', name: 'Baltic Avenue', color: 'brown', price: 60, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [4, 20, 60, 180, 320, 450] },
            { type: 'tax', name: 'Income Tax', amount: 200 },
            { type: 'railroad', name: 'Reading Railroad', price: 200, ownedByPlayerIndex: 0, isMortgaged: false, cost: [25, 50, 100, 200] },
            { type: 'street', name: 'Oriental Avenue', color: 'lightblue', price: 100, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [6, 30, 90, 270, 400, 550] },
            { type: 'chance', name: 'Chance' },
            { type: 'street', name: 'Vermont Avenue', color: 'lightblue', price: 100, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [6, 30, 90, 270, 400, 550] },
            { type: 'street', name: 'Connecticut Avenue', color: 'lightblue', price: 120, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [8, 40, 100, 300, 450, 600] },
            { type: 'jail', name: 'Jail / Just Visiting' },

            // Left Side
            { type: 'street', name: 'St. Charles Place', color: 'pink', price: 140, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [10, 50, 150, 450, 625, 750] },
            { type: 'electric-utility', name: 'Electric Company', price: 150, ownedByPlayerIndex: null, isMortgaged: false },
            { type: 'street', name: 'States Avenue', color: 'pink', price: 140, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [10, 50, 150, 450, 625, 750] },
            { type: 'street', name: 'Virginia Avenue', color: 'pink', price: 160, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [12, 60, 180, 500, 700, 900] },
            { type: 'railroad', name: 'Pennsylvania Railroad', price: 200, ownedByPlayerIndex: 0, isMortgaged: false, cost: [25, 50, 100, 200] },
            { type: 'street', name: 'St. James Place', color: 'orange', price: 180, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [14, 70, 200, 550, 750, 950] },
            { type: 'community-chest', name: 'Community Chest' },
            { type: 'street', name: 'Tennessee Avenue', color: 'orange', price: 180, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [14, 70, 200, 550, 750, 950] },
            { type: 'street', name: 'New York Avenue', color: 'orange', price: 200, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [16, 80, 220, 600, 800, 1000] },
            { type: 'free-parking', name: 'Free Parking' },

            // Top Side
            { type: 'street', name: 'Kentucky Avenue', color: 'red', price: 220, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [18, 90, 250, 700, 875, 1050] },
            { type: 'chance', name: 'Chance' },
            { type: 'street', name: 'Indiana Avenue', color: 'red', price: 220, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [18, 90, 250, 700, 875, 1050] },
            { type: 'street', name: 'Illinois Avenue', color: 'red', price: 240, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [20, 100, 300, 750, 925, 1100] },
            { type: 'railroad', name: 'B. & O. Railroad', price: 200, ownedByPlayerIndex: 0, isMortgaged: false, cost: [25, 50, 100, 200] },
            { type: 'street', name: 'Atlantic Avenue', color: 'yellow', price: 260, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [22, 110, 330, 800, 975, 1150] },
            { type: 'street', name: 'Ventnor Avenue', color: 'yellow', price: 260, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [22, 110, 330, 800, 975, 1150] },
            { type: 'water-utility', name: 'Water Works', price: 150, ownedByPlayerIndex: null, isMortgaged: false },
            { type: 'street', name: 'Marvin Gardens', color: 'yellow', price: 280, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [24, 120, 360, 850, 1025, 1200] },
            { type: 'go-to-jail', name: 'Go to Jail' },

            // Right Side
            { type: 'street', name: 'Pacific Avenue', color: 'green', price: 300, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [26, 130, 390, 900, 1100, 1275] },
            { type: 'street', name: 'North Carolina Avenue', color: 'green', price: 300, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [26, 130, 390, 900, 1100, 1275] },
            { type: 'community-chest', name: 'Community Chest' },
            { type: 'street', name: 'Pennsylvania Avenue', color: 'green', price: 320, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [28, 150, 450, 1000, 1200, 1400] },
            { type: 'railroad', name: 'Short Line', price: 200, ownedByPlayerIndex: null, isMortgaged: false, cost: [25, 50, 100, 200] },
            { type: 'chance', name: 'Chance' },
            { type: 'street', name: 'Park Place', color: 'darkblue', price: 350, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [35, 175, 500, 1100, 1300, 1500] },
            { type: 'tax', name: 'Luxury Tax', amount: 100 },
            { type: 'street', name: 'Boardwalk', color: 'darkblue', price: 400, ownedByPlayerIndex: null, isMortgaged: false, houses: 0, rent: [50, 200, 600, 1400, 1700, 2000] }
        ],
        players: [
            { id: '1', name: 'Kyle', color: 'blue', position: 0, money: 1500 },
            { id: '1', name: 'Eric', color: 'red', position: 0, money: 1500 },
            { id: '1', name: 'Megan', color: 'yellow', position: 0, money: 1500 },
            { id: '1', name: 'Elliott', color: 'green', position: 0, money: 1500 },
            { id: '1', name: 'Mom', color: 'purple', position: 0, money: 1500 },
            { id: '1', name: 'Gary', color: 'cyan', position: 0, money: 1500 },
            { id: '1', name: 'Grandma', color: 'silver', position: 0, money: 1500 },
            { id: '1', name: 'James', color: 'orange', position: 0, money: 1500 }
        ],
        phase: { type: 'ready' },
        currentPlayerIndex: 0,
        log: []
    });

    useEffect(() => updateRoute(Route.MONOPOLY), []);

    return <Monopoly state={state} id={'1'} actions={{
        roll: () => setState(engine.roll(state)),
        buyProperty: () => setState(engine.buyProperty(state))
    }} />;

    // return <MonopolyCanvas state={state} id={'1'} actions={{
    //     roll: () => setState(engine.roll(state)),
    //     buyProperty: () => setState(engine.buyProperty(state)),
    // }} />;
};

export default Home;
