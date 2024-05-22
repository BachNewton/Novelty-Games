export function get(): Promise<any> {
    // Alernative API: https://rcdb-api.vercel.app/api/coasters
    const URL = 'https://raw.githubusercontent.com/fabianrguez/rcdb-api/main/db/coasters.json';

    return fetch(URL).then(response => response.json()).then(json => {
        return json;
    });
}
