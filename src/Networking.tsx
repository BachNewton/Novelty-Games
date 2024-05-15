import { Rollercoaster } from './Data';

export default function fecthData(): Promise<Array<Rollercoaster>> {
    // Alernative API: https://rcdb-api.vercel.app/api/coasters
    const URL = 'https://raw.githubusercontent.com/fabianrguez/rcdb-api/main/db/coasters.json';

    return fetch(URL).then(response => response.json()).then(json => {
        const rollercoasters = cleanData(json);
        console.log('All Rollercoasters', rollercoasters);

        const filteredRollercoasters = filterCoasters(rollercoasters);
        console.log('Filtered Rollercoasters', filteredRollercoasters);

        return filteredRollercoasters;
    });
}

function cleanData(json: any): Array<Rollercoaster> {
    const rollercoasters = json as Array<Rollercoaster>;

    rollercoasters.forEach(coaster => {
        const opened = coaster.status.date.opened;
        const opendYear = opened.substring(0, opened.indexOf('-'));
        // Only keep the year from the opened data.
        coaster.status.date.opened = opendYear === '' ? 'Unknown' : opendYear;

        coaster.model = coaster.model === '' ? 'Unknown' : coaster.model;
    });

    return rollercoasters;
}

function filterCoasters(coasters: Array<Rollercoaster>): Array<Rollercoaster> {
    const parksCoastersCount = getParksCoastersCount(coasters);

    return coasters.filter(coaster => {
        if (coaster.status.state !== 'Operating') return false;
        if (coaster.country !== 'United States') return false;
        if (['Junior Coaster', 'Kiddie Coaster', 'Family Coaster'].includes(coaster.model)) return false;
        if (coaster.make === 'Wiegand') return false;
        if (parksCoastersCount.get(coaster.park.name) === 1) return false;
        if (coaster.park.name.includes('Pizza')) return false;
        if (coaster.park.name.includes('Farm') && coaster.park.name !== "Knott's Berry Farm") return false;

        return true;
    })
}

function getParksCoastersCount(coasters: Array<Rollercoaster>): Map<string, number> {
    const parksCoastersCount = new Map<string, number>();

    for (const coaster of coasters) {
        const count = parksCoastersCount.get(coaster.park.name);
        parksCoastersCount.set(coaster.park.name, count === undefined ? 1 : count + 1);
    }

    return parksCoastersCount;
}
