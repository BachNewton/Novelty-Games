import { Rollercoaster } from "./Data";
import { get as getFromDb, store as storeInDb } from "./Database";
import { get as getFromNetwork } from "./Networking";

export function get(): Promise<Array<Rollercoaster>> {
    return getFromDb().then(json => {
        console.log('From DB:', json);

        return handleJson(json);
    }).catch(_ => {
        console.log('No data in DB');

        return getFromNetwork().then(json => {
            console.log('From Network:', json);

            storeInDb(json);

            return handleJson(json);
        });
    });
}

function handleJson(json: any): Array<Rollercoaster> {
    const rollercoasters = cleanData(json);
    console.log('All Rollercoasters', rollercoasters);

    const filteredRollercoasters = filterCoasters(rollercoasters);
    console.log('Filtered Rollercoasters', filteredRollercoasters);

    return filteredRollercoasters;
}

function cleanData(json: any): Array<Rollercoaster> {
    const rollercoasters = json as Array<Rollercoaster>;

    rollercoasters.forEach(coaster => {
        const opened = coaster.status.date.opened;
        const opendYear = opened.substring(0, opened.indexOf('-'));
        // Only keep the year from the opened data.
        coaster.status.date.opened = opendYear === '' ? 'Unknown' : opendYear;

        coaster.make = coaster.make === '' ? 'Unknown' : coaster.make;
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