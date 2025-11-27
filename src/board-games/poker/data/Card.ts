export interface Card {
    rank: string;
    suit: Suit;
}

export enum Suit {
    HEARTS = 'H', DIAMONDS = 'D', CLUBS = 'C', SPADES = 'S'
}

export function toCard(cardStr: string): Card | null {
    const parsed = cardStr.match(/(\d+)(H|D|C|S)/);

    if (parsed === null) {
        return null;
    }

    return {
        rank: toRank(parsed[1]),
        suit: parsed[2] as Suit
    };
}

function toRank(rank: string): string {
    switch (rank) {
        case '11':
            return 'J';
        case '12':
            return 'Q';
        case '13':
            return 'K';
        case '14':
            return 'A';
        default:
            return rank;
    }
}
