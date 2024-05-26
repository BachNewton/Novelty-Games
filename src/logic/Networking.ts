import { DataType } from "./Data";

// Alernative API: https://rcdb-api.vercel.app/api/coasters
const ROLLERCOASTERS_URL = 'https://raw.githubusercontent.com/fabianrguez/rcdb-api/main/db/coasters.json';

const MUSIC_URL = 'https://raw.githubusercontent.com/BachNewton/PWA-Trivia/main/db/music.json';

export function get(dataType: DataType): Promise<any> {
    const url = getUrl(dataType);

    console.log('Fetching data for', dataType);
    console.log('Fecthing data from', url);

    return fetch(url).then(response => response.json()).then(json => {
        return json;
    });
}

function getUrl(dataType: DataType) {
    if (dataType === DataType.ROLLERCOASTERS) {
        return ROLLERCOASTERS_URL;
    } else {
        return MUSIC_URL;
    }
}
