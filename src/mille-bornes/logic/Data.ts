export enum CardType {
    HAZARD,
    REMEDIES,
    SAFETIES,
    DISTANCE
}

export interface Card {
    type: CardType;
    image: string;
}

export interface Game {
    deck: Array<Card>;
    hand: Array<Card>;
}
