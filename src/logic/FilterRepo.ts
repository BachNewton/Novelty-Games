import { Rollercoaster } from "./Data";

const ROLLERCOASTER_FILTER_KEY = 'ROLLERCOASTER_FILTER_KEY';

export interface RollercoasterFilter {
    countries: Map<string, boolean>;
    models: Map<string, boolean>;
}

interface RollercoasterFilterJson {
    countries: [string, boolean][];
    models: [string, boolean][];
}

export function saveFilter(rollercoasterFilter: RollercoasterFilter) {
    const rollercoasterFilterJson = {
        countries: Array.from(rollercoasterFilter.countries.entries()),
        models: Array.from(rollercoasterFilter.models.entries())
    } as RollercoasterFilterJson;

    localStorage.setItem(ROLLERCOASTER_FILTER_KEY, JSON.stringify(rollercoasterFilterJson));
}

export function loadFilter(): RollercoasterFilter | null {
    const rollercoasterFilterJsonString = localStorage.getItem(ROLLERCOASTER_FILTER_KEY);

    if (rollercoasterFilterJsonString !== null) {
        const rollercoasterFilterJson = JSON.parse(rollercoasterFilterJsonString) as RollercoasterFilterJson;

        return {
            countries: new Map(rollercoasterFilterJson.countries),
            models: new Map(rollercoasterFilterJson.models)
        };
    } else {
        return null;
    }
}

export async function filter(coasters: Promise<Array<Rollercoaster>>): Promise<Array<Rollercoaster>> {
    const baseFilteredCoasters = baseFilter(await coasters);

    const filter = loadFilter();

    const filteredCoasters = filter === null
        ? baseFilteredCoasters
        : filterAll(filter, baseFilteredCoasters);

    console.log('Filtered Rollercoasters', filteredCoasters);

    return filteredCoasters;
}

function filterAll(filter: RollercoasterFilter, coasters: Array<Rollercoaster>): Array<Rollercoaster> {
    const filterByCountry = filterByProperty(filter.countries, coasters, coaster => coaster.country);
    const filterByModel = filterByProperty(filter.models, filterByCountry, coaster => coaster.model);

    const filteredCoasters = filterByModel;

    return filteredCoasters;
}

export function filterByProperty(
    filter: Map<string, boolean>,
    coasters: Array<Rollercoaster>,
    getProperty: (coaster: Rollercoaster) => string
): Array<Rollercoaster> {
    return coasters.filter(coaster => {
        if (!filter.get(getProperty(coaster))) return false;

        return true;
    });
}

export function deleteFilter() {
    localStorage.removeItem(ROLLERCOASTER_FILTER_KEY);
}

export function baseFilter(coasters: Array<Rollercoaster>): Array<Rollercoaster> {
    const parksCoastersCount = getParksCoastersCount(coasters);

    return coasters.filter(coaster => {
        if (coaster.status.state !== 'Operating') return false;
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
