export type Square = Property | Chance | CommunityChest | Tax | Jail | Go | FreeParking | GoToJail;

type Property = Street | Railroad | Utility;

export enum Side { BOTTOM, LEFT, TOP, RIGHT }

interface Street {
    type: 'street';
    name: string;
    side: Side;
    color: string;
    price: number;
}

interface Railroad {
    type: 'railroad';
    name: string;
    side: Side;
    price: number;
}

interface Utility {
    type: 'utility';
    name: string;
    side: Side;
    price: number;
}

interface Chance {
    type: 'chance';
    name: string;
    side: Side;
}

interface CommunityChest {
    type: 'community-chest';
    name: string;
    side: Side;
}

interface Tax {
    type: 'tax';
    name: string;
    side: Side;
    amount: number;
}

interface Jail {
    type: 'jail';
    name: string;
    side: Side;
}

interface Go {
    type: 'go';
    name: string;
    side: Side;
}

interface FreeParking {
    type: 'free-parking';
    name: string;
    side: Side;
}

interface GoToJail {
    type: 'go-to-jail';
    name: string;
    side: Side;
}
