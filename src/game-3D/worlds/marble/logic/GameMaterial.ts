export enum GameMaterial {
    NORMAL, SLIPPERY, BOUNCY
}

export function gameMaterialToString(material: GameMaterial): string {
    switch (material) {
        case GameMaterial.NORMAL:
            return 'NORMAL';
        case GameMaterial.SLIPPERY:
            return 'SLIPPERY';
        case GameMaterial.BOUNCY:
            return 'BOUNCY';
    }
}

export function stringToGameMaterial(string: string): GameMaterial {
    switch (string) {
        case 'NORMAL':
            return GameMaterial.NORMAL;
        case 'SLIPPERY':
            return GameMaterial.SLIPPERY;
        case 'BOUNCY':
            return GameMaterial.BOUNCY;
        default:
            throw new Error(`String not supported: "${string}"`);
    }
}
