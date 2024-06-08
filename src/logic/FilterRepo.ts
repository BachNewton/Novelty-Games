import { Rollercoaster } from "./Data";

const ROLLERCOASTER_FILTER_KEY = 'ROLLERCOASTER_FILTER_KEY';

export interface RollercoasterFilter {
    countries: Map<string, boolean>;
    models: Map<string, boolean>;
    parks: Map<string, boolean>;
}

interface RollercoasterFilterJson {
    countries: [string, boolean][];
    models: [string, boolean][];
    parks: [string, boolean][];
}

export interface FilterAndPropertyGetter {
    filter: Map<string, boolean>;
    getProperty: (coaster: Rollercoaster) => string;
}

export interface FilterResult {
    before: number;
    after: number;
}

export function saveFilter(rollercoasterFilter: RollercoasterFilter) {
    const rollercoasterFilterJson: RollercoasterFilterJson = {
        countries: Array.from(rollercoasterFilter.countries.entries()),
        models: Array.from(rollercoasterFilter.models.entries()),
        parks: Array.from(rollercoasterFilter.parks.entries())
    };

    localStorage.setItem(ROLLERCOASTER_FILTER_KEY, JSON.stringify(rollercoasterFilterJson));
}

function loadFilter(): RollercoasterFilter | null {
    const rollercoasterFilterJsonString = localStorage.getItem(ROLLERCOASTER_FILTER_KEY);

    if (rollercoasterFilterJsonString !== null) {
        const rollercoasterFilterJson = JSON.parse(rollercoasterFilterJsonString) as RollercoasterFilterJson;

        return {
            countries: new Map(rollercoasterFilterJson.countries),
            models: new Map(rollercoasterFilterJson.models),
            parks: new Map(rollercoasterFilterJson.parks)
        };
    } else {
        return null;
    }
}

export async function filter(pendingCoasters: Promise<Array<Rollercoaster>>): Promise<Array<Rollercoaster>> {
    const coasters = await pendingCoasters;

    const baseFilteredCoasters = baseFilter(coasters);

    const filter = getFilter(coasters, baseFilteredCoasters);
    const filteredCoasters = filterAll(filter, baseFilteredCoasters);

    console.log('Filtered Rollercoasters', filteredCoasters);

    return filteredCoasters;
}

export function getFilter(coasters: Array<Rollercoaster>, baseFilteredCoasters: Array<Rollercoaster>): RollercoasterFilter {
    const loadedFilter = loadFilter();

    const filter: RollercoasterFilter = loadedFilter === null
        ? { countries: new Map(), models: new Map(), parks: new Map() }
        : loadedFilter;

    const isCountriesEmpty = filter.countries.size === 0;
    const isModelsEmpty = filter.models.size === 0;
    const isParksEmpty = filter.parks.size === 0;

    if (isCountriesEmpty || isModelsEmpty || isParksEmpty) {
        if (isCountriesEmpty) {
            filter.countries = getCountriesDefaultFilter(getCountriesCoastersCount(coasters, baseFilteredCoasters));
        }

        if (isModelsEmpty) {
            filter.models = getModelsDefaultFilter(getModelsCoastersCount(coasters, baseFilteredCoasters));
        }

        if (isParksEmpty) {
            filter.parks = getParksDefaultFilter(getParksCoastersCount(coasters, baseFilteredCoasters));
        }

        saveFilter(filter);
    }

    return filter;
}

function getCountriesCoastersCount(allCoasters: Array<Rollercoaster>, filteredCoasters: Array<Rollercoaster>) {
    return getCoasterCountBasedOnProperty(allCoasters, filteredCoasters, coaster => coaster.country);
}

function getModelsCoastersCount(allCoasters: Array<Rollercoaster>, filteredCoasters: Array<Rollercoaster>) {
    return getCoasterCountBasedOnProperty(allCoasters, filteredCoasters, coaster => coaster.model);
}

function getParksCoastersCount(allCoasters: Array<Rollercoaster>, filteredCoasters: Array<Rollercoaster>) {
    return getCoasterCountBasedOnProperty(allCoasters, filteredCoasters, coaster => coaster.park.name);
}

function getCoasterCountBasedOnProperty(
    allCoasters: Array<Rollercoaster>,
    filteredCoasters: Array<Rollercoaster>,
    getProperty: (coaster: Rollercoaster) => string
): Map<string, FilterResult> {
    const coastersCount = new Map<string, FilterResult>();

    for (const coaster of allCoasters) {
        const property = getProperty(coaster)
        const filterResult = coastersCount.get(property);
        coastersCount.set(property, { before: (filterResult?.before || 0) + 1, after: filterResult?.after || 0 });
    }

    for (const coaster of filteredCoasters) {
        const property = getProperty(coaster)
        const filterResult = coastersCount.get(property);
        coastersCount.set(property, { before: filterResult?.before || 0, after: (filterResult?.after || 0) + 1 });
    }

    return coastersCount;
}

function getCountriesDefaultFilter(countriesCoastersCount: Map<string, FilterResult>): Map<string, boolean> {
    const countriesCheckedMap = new Map<string, boolean>();

    for (const country of Array.from(countriesCoastersCount.keys())) {
        countriesCheckedMap.set(country, country === 'United States');
    }

    return countriesCheckedMap;
}

function getModelsDefaultFilter(modelsCoastersCount: Map<string, FilterResult>): Map<string, boolean> {
    const modelsCheckedMap = new Map<string, boolean>();

    for (const model of Array.from(modelsCoastersCount.keys())) {
        modelsCheckedMap.set(model, !['Junior Coaster', 'Kiddie Coaster', 'Family Coaster'].includes(model));
    }

    return modelsCheckedMap;
}

function getParksDefaultFilter(parksCoastersCount: Map<string, FilterResult>): Map<string, boolean> {
    const parksCheckedMap = new Map<string, boolean>();

    for (const park of Array.from(parksCoastersCount.keys())) {
        const onlyOneCoaster = parksCoastersCount.get(park)?.after === 1;
        const hasPizzaInName = park.includes('Pizza');
        const hasFarmInName = park.includes('Farm') && park !== "Knott's Berry Farm";
        const includePark = !onlyOneCoaster && !hasPizzaInName && !hasFarmInName;
        parksCheckedMap.set(park, includePark);
    }

    return parksCheckedMap;
}

export function filterByProperties(
    coasters: Array<Rollercoaster>,
    filtersAndPropertyGetters: Array<FilterAndPropertyGetter>
): Array<Rollercoaster> {
    let filteredCoasters = coasters;

    for (const filterPropertyGetter of filtersAndPropertyGetters) {
        filteredCoasters = filterByProperty(filterPropertyGetter.filter, filteredCoasters, filterPropertyGetter.getProperty);
    }

    return filteredCoasters;
}

function filterAll(filter: RollercoasterFilter, coasters: Array<Rollercoaster>): Array<Rollercoaster> {
    return filterByProperties(coasters, [
        { filter: filter.countries, getProperty: coaster => coaster.country },
        { filter: filter.models, getProperty: coaster => coaster.model },
        { filter: filter.parks, getProperty: coaster => coaster.park.name }
    ]);
}

function filterByProperty(
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
    return coasters.filter(coaster => {
        if (coaster.status.state !== 'Operating') return false;
        if (coaster.make === 'Wiegand') return false;

        return true;
    })
}
