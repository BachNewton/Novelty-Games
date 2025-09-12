export type Square = Property | Chance | CommunityChest | Tax | Jail | Go | FreeParking | GoToJail;

export type Property = Street | Railroad | Utility;

type Utility = ElectricUtility | WaterUtility;

export interface Street {
    type: 'street';
    name: string;
    color: string;
    price: number;
    ownedByPlayerIndex: number | null;
    isMortgaged: boolean;
    rent: number[];
    houses: number;
}

interface Railroad {
    type: 'railroad';
    name: string;
    price: number;
    ownedByPlayerIndex: number | null;
    isMortgaged: boolean;
    cost: number[];
}

interface ElectricUtility {
    type: 'electric-utility';
    name: string;
    price: number;
    ownedByPlayerIndex: number | null;
    isMortgaged: boolean;
}

interface WaterUtility {
    type: 'water-utility';
    name: string;
    price: number;
    ownedByPlayerIndex: number | null;
    isMortgaged: boolean;
}

interface Chance {
    type: 'chance';
    name: string;
}

interface CommunityChest {
    type: 'community-chest';
    name: string;
}

interface Tax {
    type: 'tax';
    name: string;
    amount: number;
}

interface Jail {
    type: 'jail';
    name: string;
}

interface Go {
    type: 'go';
    name: string;
}

interface FreeParking {
    type: 'free-parking';
    name: string;
}

interface GoToJail {
    type: 'go-to-jail';
    name: string;
}
