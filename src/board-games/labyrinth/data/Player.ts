export interface Player {
    name: string;
    color: PlayerColor;
    position: PlayerPosition;
}

export enum PlayerColor {
    RED, BLUE, YELLOW, GREEN
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
