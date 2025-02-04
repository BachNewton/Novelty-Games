import { Treasure } from "./Treasure";

export interface Player {
    name: string;
    color: PlayerColor;
    position: PlayerPosition;
    treasurePile: Treasure[];
}

export enum PlayerColor {
    RED, BLUE, YELLOW, GREEN
}

export function createPlayer(name: string, color: PlayerColor): Player {
    return {
        name: name,
        color: color,
        position: { x: -1, y: -1 },
        treasurePile: []
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
