import { getRandomElement } from "./Randomizer";

const ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const ID_SEGMENTS = [4, 4, 4, 4];
const ID_DELIMITER = '-';

export function createID(): string {
    return ID_SEGMENTS.map(
        segment => Array.from(
            { length: segment }, () => getRandomElement(ID_CHARS)
        ).join('')
    ).join(ID_DELIMITER);
}
