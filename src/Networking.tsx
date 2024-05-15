import { Rollercoaster } from './Data';

export default function fecthData(): Promise<Array<Rollercoaster>> {
    // Alernative API: https://rcdb-api.vercel.app/api/coasters
    const URL = 'https://raw.githubusercontent.com/fabianrguez/rcdb-api/main/db/coasters.json';

    return fetch(URL).then(response => response.json()).then(json => {
        const rollercoasters = json as Array<Rollercoaster>;
        console.log('All Rollercoasters', rollercoasters);

        const filteredRollercoasters = filterCoasters(rollercoasters);
        console.log('Filtered Rollercoasters', filteredRollercoasters);

        return filteredRollercoasters;
    });
}

function filterCoasters(coasters: Array<Rollercoaster>): Array<Rollercoaster> {
    const parksCoastersCount = getParksCoastersCount(coasters);

    return coasters.filter(coaster => {
        if (coaster.status.state !== 'Operating') return false;
        if (coaster.country !== 'United States') return false;
        if (['Junior Coaster', 'Kiddie Coaster', 'Family Coaster'].includes(coaster.model)) return false;
        if (coaster.make === 'Wiegand') return false;
        if (parksCoastersCount.get(coaster.park.name) === 1) return false;

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
