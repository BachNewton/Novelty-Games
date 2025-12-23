import { RegionStyle, BiomeType } from '../data/ChunkTypes';
import { createSeededRandom, hashCoordinate } from './SeededRandom';

export interface NameGenerator {
    generateCityName: (style: RegionStyle, worldX: number, worldY: number) => string;
    generateRegionName: (style: RegionStyle, biome: BiomeType, worldX: number, worldY: number) => string;
}

interface NameParts {
    prefixes: string[];
    roots: string[];
    suffixes: string[];
}

const NAME_PARTS: Record<RegionStyle, NameParts> = {
    [RegionStyle.NORDIC]: {
        prefixes: ['Thor', 'Frost', 'Iron', 'Storm', 'Wolf', 'Raven', 'Snow', 'Ice', 'Stone', 'Bear'],
        roots: ['heim', 'gard', 'fjord', 'vik', 'dal', 'berg', 'holm', 'vang', 'fell', 'mark'],
        suffixes: ['en', '', 'stad', 'by', 'ness']
    },
    [RegionStyle.CELTIC]: {
        prefixes: ['Dun', 'Glen', 'Bally', 'Kin', 'Strath', 'Aber', 'Kil', 'Loch', 'Ben', 'Cairn'],
        roots: ['more', 'derry', 'bridge', 'ford', 'wick', 'ton', 'wood', 'field', 'vale', 'moor'],
        suffixes: ['', 'ey', 'ie', 'ach', 'an']
    },
    [RegionStyle.LATIN]: {
        prefixes: ['Port', 'Villa', 'Monte', 'Bella', 'Alta', 'Nova', 'Santa', 'San', 'Rio', 'Terra'],
        roots: ['vista', 'mare', 'rosa', 'verde', 'luna', 'sol', 'oro', 'plata', 'cruz', 'piedra'],
        suffixes: ['', 'ia', 'um', 'ino', 'ero']
    },
    [RegionStyle.DESERT]: {
        prefixes: ['Al', 'El', 'Kas', 'Dar', 'Bab', 'Wadi', 'Oum', 'Ain', 'Jebel', 'Ras'],
        roots: ['rashid', 'salem', 'qadir', 'malik', 'hamid', 'kareem', 'zahir', 'nadir', 'farid', 'jamil'],
        suffixes: ['', 'a', 'i', 'abad', 'stan']
    },
    [RegionStyle.EASTERN]: {
        prefixes: ['Jade', 'Golden', 'Silver', 'Dragon', 'Phoenix', 'Moon', 'Sun', 'Cloud', 'Misty', 'Crane'],
        roots: ['peak', 'river', 'gate', 'bridge', 'garden', 'temple', 'spring', 'lake', 'forest', 'mountain'],
        suffixes: ['', ' Valley', ' Heights', ' Crossing', '']
    },
    [RegionStyle.FANTASY]: {
        prefixes: ['Shadow', 'Crystal', 'Silver', 'Ember', 'Thorn', 'Mist', 'Star', 'Dawn', 'Dusk', 'Rune'],
        roots: ['mere', 'vale', 'spire', 'haven', 'hold', 'gate', 'wood', 'glade', 'keep', 'reach'],
        suffixes: ['', 'shire', 'land', 'fell', 'dale']
    }
};

const BIOME_WORDS: Record<BiomeType, string[]> = {
    [BiomeType.DEEP_OCEAN]: ['Abyss', 'Depths', 'Deep'],
    [BiomeType.OCEAN]: ['Sea', 'Waters', 'Ocean'],
    [BiomeType.COASTAL_WATER]: ['Bay', 'Gulf', 'Strait'],
    [BiomeType.BEACH]: ['Shore', 'Coast', 'Strand'],
    [BiomeType.PLAINS]: ['Plains', 'Grasslands', 'Steppes', 'Prairie'],
    [BiomeType.FOREST]: ['Forest', 'Woods', 'Woodland', 'Grove'],
    [BiomeType.JUNGLE]: ['Jungle', 'Rainforest', 'Wilds'],
    [BiomeType.DESERT]: ['Desert', 'Wastes', 'Sands', 'Dunes'],
    [BiomeType.HILLS]: ['Hills', 'Highlands', 'Downs'],
    [BiomeType.MOUNTAINS]: ['Mountains', 'Peaks', 'Range', 'Heights'],
    [BiomeType.SNOW_PEAKS]: ['Frostpeaks', 'Snowcaps', 'Icepeaks'],
    [BiomeType.TUNDRA]: ['Tundra', 'Wastes', 'Barrens', 'Expanse'],
    [BiomeType.SWAMP]: ['Swamp', 'Marsh', 'Bog', 'Mire'],
    [BiomeType.LAKE]: ['Lake', 'Loch', 'Mere'],
    [BiomeType.RIVER]: ['River', 'Stream', 'Waters']
};

export function createNameGenerator(seed: number): NameGenerator {
    return {
        generateCityName: (style, worldX, worldY) => {
            // Use coordinates to create a deterministic seed for this location
            const locationSeed = hashCoordinate(Math.floor(worldX), Math.floor(worldY), seed + 7919);
            const rng = createSeededRandom(locationSeed);
            const parts = NAME_PARTS[style];

            const usePrefix = rng.next() < 0.7;
            const useSuffix = rng.next() < 0.5;

            let name = '';

            if (usePrefix) {
                name += rng.pick(parts.prefixes);
            }

            name += rng.pick(parts.roots);

            if (useSuffix) {
                name += rng.pick(parts.suffixes);
            }

            // Capitalize first letter
            return name.charAt(0).toUpperCase() + name.slice(1);
        },

        generateRegionName: (style, biome, worldX, worldY) => {
            // Use coordinates to create a deterministic seed for this location
            const locationSeed = hashCoordinate(Math.floor(worldX), Math.floor(worldY), seed + 8923);
            const rng = createSeededRandom(locationSeed);
            const parts = NAME_PARTS[style];
            const biomeWords = BIOME_WORDS[biome] || ['Lands'];

            const patterns = [
                () => `The ${rng.pick(parts.prefixes)} ${rng.pick(biomeWords)}`,
                () => `${rng.pick(parts.prefixes)}${rng.pick(parts.roots)} ${rng.pick(biomeWords)}`,
                () => `${rng.pick(biomeWords)} of ${rng.pick(parts.prefixes)}${rng.pick(parts.roots)}`
            ];

            return rng.pick(patterns)();
        }
    };
}
