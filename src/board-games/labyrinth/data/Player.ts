import { Treasure } from "./Treasure";

export interface Player {
    name: string;
    color: PlayerColor;
    position: PlayerPosition;
    treasureDetails: TreasureDetails;
}

export interface TreasureDetails {
    pile: Treasure[];
    targetIndex: number;
}

export enum PlayerColor {
    RED, BLUE, YELLOW, GREEN
}

export function createPlayer(name: string, color: PlayerColor): Player {
    return {
        name: name,
        color: color,
        position: { x: -1, y: -1 },
        treasureDetails: {
            pile: [],
            targetIndex: 0
        }
    };
}

export interface PlayerPosition {
    x: number;
    y: number;
}

export function getColor(color: PlayerColor): string {
    switch (color) {
        case PlayerColor.RED:
            return 'red';
        case PlayerColor.BLUE:
            return 'blue';
        case PlayerColor.YELLOW:
            return 'yellow';
        case PlayerColor.GREEN:
            return 'green';
    }
}
