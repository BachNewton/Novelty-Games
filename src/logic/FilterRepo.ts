import { Rollercoaster } from "./Data";

const ROLLERCOASTER_FILTER_KEY = 'ROLLERCOASTER_FILTER_KEY';

export interface RollercoasterFilter {
    countries: Map<string, boolean>;
}

interface RollercoasterFilterJson {
    countries: [string, boolean][];
}

export function saveFilter(rollercoasterFilter: RollercoasterFilter) {
    const rollercoasterFilterJson = { countries: Array.from(rollercoasterFilter.countries.entries()) } as RollercoasterFilterJson;

    localStorage.setItem(ROLLERCOASTER_FILTER_KEY, JSON.stringify(rollercoasterFilterJson));
}

export function loadFilter(): RollercoasterFilter | null {
    const rollercoasterFilterJsonString = localStorage.getItem(ROLLERCOASTER_FILTER_KEY);

    if (rollercoasterFilterJsonString !== null) {
        const rollercoasterFilterJson = JSON.parse(rollercoasterFilterJsonString) as RollercoasterFilterJson;
        return { countries: new Map(rollercoasterFilterJson.countries) };
    } else {
        return null;
    }
}

export async function filter(coasters: Promise<Array<Rollercoaster>>): Promise<Array<Rollercoaster>> {
    const baseFilteredCoasters = baseFilter(await coasters);

    const filter = loadFilter();

    const filteredCoasters = filter === null
        ? baseFilteredCoasters
        : baseFilteredCoasters.filter(coaster => {
            if (!filter.countries.get(coaster.country)) return false;

            return true;
        });

    console.log('Filtered Rollercoasters', filteredCoasters);

    return filteredCoasters;
}

export function deleteFilter() {
    localStorage.removeItem(ROLLERCOASTER_FILTER_KEY);
}

function baseFilter(coasters: Array<Rollercoaster>): Array<Rollercoaster> {
    const parksCoastersCount = getParksCoastersCount(coasters);

    return coasters.filter(coaster => {
        if (coaster.status.state !== 'Operating') return false;
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
