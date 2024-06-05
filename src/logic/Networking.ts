import { DataType } from "./Data";
import { ProgressEmitter } from "./ProgressUpdater";

// Alernative API: https://rcdb-api.vercel.app/api/coasters
const ROLLERCOASTERS_URL = 'https://raw.githubusercontent.com/fabianrguez/rcdb-api/main/db/coasters.json';

const MUSIC_URL = 'https://raw.githubusercontent.com/BachNewton/PWA-Trivia/main/db/music.json';

const FLAG_GAME_URL = 'https://flagcdn.com/en/codes.json';

const POKEMON_URL = 'https://pokeapi.co/api/v2/pokemon?limit=100000';

export async function get(dataType: DataType, progressEmitter: ProgressEmitter, optionalUrls?: Array<string>): Promise<any> {
    const urls = optionalUrls === undefined ? [getUrl(dataType)] : optionalUrls;

    console.log('Fetching data for', dataType);
    console.log('Fecthing data from', urls);

    return await getFrom(urls, progressEmitter);
}

function getUrl(dataType: DataType): string {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            return ROLLERCOASTERS_URL;
        case DataType.MUSIC:
            return MUSIC_URL;
        case DataType.FLAG_GAME:
            return FLAG_GAME_URL;
        case DataType.POKEMON_ALL:
            return POKEMON_URL;
        case DataType.POKEMON:
            return ''; // optional urls should be provided
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

async function getFrom(urls: Array<string>, progressEmitter: ProgressEmitter): Promise<Array<any>> {
    const total = urls.length;
    let current = 0

    progressEmitter.emit({ current: current, total }); // Emit initial progress

    return await Promise.all(urls.map(async url => {
        const json = await fetchJson(url);
        progressEmitter.emit({ current: ++current, total }); // Update progress for each fetched JSON
        return json;
    }));
}

async function fetchJson(url: string): Promise<any> {
    const response = await fetch(url);
    const json = await response.json();
    return json;
}
