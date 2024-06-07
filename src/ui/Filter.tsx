import { useEffect, useState } from "react";
import '../css/Filter.css';
import { Rollercoaster } from "../logic/Data";
import { RollercoasterFilter, baseFilter, filterByProperty, loadFilter, saveFilter } from "../logic/FilterRepo";

interface FilterProps {
    pendingCoasters: Promise<Array<Rollercoaster>>;
    onCancel: () => void;
    onConfirm: (rollercoasterFilter: RollercoasterFilter) => void;
}

interface State {
    allCoasters: Array<Rollercoaster>;
    filteredCoasters: Array<Rollercoaster>;
    ui: UiState;
    rollercoasterFilter: RollercoasterFilter;
}

enum UiState {
    LOADING,
    FILTER
}

interface FilterResult {
    before: number;
    after: number;
}

const Filter: React.FC<FilterProps> = ({ pendingCoasters, onCancel, onConfirm }) => {
    const [state, setState] = useState({ ui: UiState.LOADING } as State);

    useEffect(() => {
        pendingCoasters.then(readyCoasters => {
            state.allCoasters = readyCoasters;
            state.filteredCoasters = baseFilter(readyCoasters);
            console.log('Base filtered coasters', state.filteredCoasters);

            const filter = loadFilter();

            state.rollercoasterFilter = filter === null
                ? getAndSaveDefaultFilter(
                    getCountriesCheckedMap(getCountriesCoastersCount(state.allCoasters, state.filteredCoasters)),
                    getModelsCheckedMap(getModelsCoastersCount(state.allCoasters, state.filteredCoasters))
                )
                : filter;

            state.ui = UiState.FILTER;

            setState({ ...state });
        });
    }, [pendingCoasters]);

    return <div className="Filter">{Ui(state, setState, onCancel, () => { onConfirm(state.rollercoasterFilter) })}</div>;
};

function Ui(state: State, setState: React.Dispatch<React.SetStateAction<State>>, onCancel: () => void, onConfirm: () => void) {
    switch (state.ui) {
        case UiState.LOADING:
            return LoadingUi();
        case UiState.FILTER:
            return FilterUi(state, setState, onCancel, onConfirm);
    }
}

function LoadingUi() {
    return <p>Loading...</p>;
}

function FilterUi(state: State, setState: React.Dispatch<React.SetStateAction<State>>, onCancel: () => void, onConfirm: () => void) {
    const sorter = (a: [string, FilterResult], b: [string, FilterResult]) => b[1].after - a[1].after;

    const modelsCoastersCountUi = Array.from(getModelsCoastersCount(state.allCoasters, filterByProperty(state.rollercoasterFilter.countries, state.filteredCoasters, coaster => coaster.country))).sort(sorter).map((countryCoasterCount, index) => {
        const model = countryCoasterCount[0];
        const filerResult = countryCoasterCount[1];

        const onChange = () => {
            const before = state.rollercoasterFilter.models.get(model) === true;
            state.rollercoasterFilter.models.set(model, !before);
            setState({ ...state });
        };

        return <tr key={index}>
            <td><input type="checkbox" checked={state.rollercoasterFilter.models.get(model)} onChange={onChange} /></td>
            <td>{model}</td>
            <td>{filerResult.after} <span className="before-filter">{filerResult.before}</span></td>
        </tr>
    });

    const countriesCoastersCountUi = Array.from(getCountriesCoastersCount(state.allCoasters, filterByProperty(state.rollercoasterFilter.models, state.filteredCoasters, coaster => coaster.model))).sort(sorter).map((countryCoasterCount, index) => {
        const country = countryCoasterCount[0];
        const filerResult = countryCoasterCount[1];

        const onChange = () => {
            const before = state.rollercoasterFilter.countries.get(country) === true;
            state.rollercoasterFilter.countries.set(country, !before);
            setState({ ...state });
        };

        return <tr key={index}>
            <td><input type="checkbox" checked={state.rollercoasterFilter.countries.get(country)} onChange={onChange} /></td>
            <td>{country}</td>
            <td>{filerResult.after} <span className="before-filter">{filerResult.before}</span></td>
        </tr>
    });

    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button style={{ position: 'fixed', left: '0.25em' }} onClick={onCancel}>❌ Cancel</button>
        <button style={{ position: 'fixed', right: '0.25em' }} onClick={onConfirm}>Confirm ✅</button>
        <h1>Coaster Filters</h1>
        <div className="bottom-border">
            <h3>Default filter already applied</h3>
            <ul>
                <li>Only operating coasters</li>
                <li>Exclude Wiegand coaster maker</li>
                <li>Exclude all parks with 1 coaster or less</li>
                <li>Exclude all parks with 'Pizza' in the name</li>
                <li>Exclude all parks with 'Farm' in the name, except "Knott's Berry Farm"</li>
            </ul>
        </div>
        <table className="bottom-border" style={{ textAlign: 'left' }}>
            <thead>
                <tr>
                    <th></th>
                    <th>Model</th>
                    <th>Coaster Count</th>
                </tr>
            </thead>
            <tbody>{modelsCoastersCountUi}</tbody>
        </table>
        <br />
        <table style={{ textAlign: 'left' }}>
            <thead>
                <tr>
                    <th></th>
                    <th>Country</th>
                    <th>Coaster Count</th>
                </tr>
            </thead>
            <tbody>{countriesCoastersCountUi}</tbody>
        </table>
    </div>;
}

function getCountriesCoastersCount(allCoasters: Array<Rollercoaster>, filteredCoasters: Array<Rollercoaster>) {
    return getCoasterCountBasedOnProperty(allCoasters, filteredCoasters, coaster => coaster.country);
}

function getModelsCoastersCount(allCoasters: Array<Rollercoaster>, filteredCoasters: Array<Rollercoaster>) {
    return getCoasterCountBasedOnProperty(allCoasters, filteredCoasters, coaster => coaster.model);
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

function getAndSaveDefaultFilter(countriesCheckedMap: Map<string, boolean>, modelsCheckedMap: Map<string, boolean>): RollercoasterFilter {
    const rollercoasterFilter = { countries: countriesCheckedMap, models: modelsCheckedMap } as RollercoasterFilter;

    saveFilter(rollercoasterFilter);

    return rollercoasterFilter;
}

function getCountriesCheckedMap(countriesCoastersCount: Map<string, FilterResult>): Map<string, boolean> {
    const countriesCheckedMap = new Map<string, boolean>();

    for (const country of Array.from(countriesCoastersCount.keys())) {
        countriesCheckedMap.set(country, country === 'United States'); // Default only USA enabled
    }

    return countriesCheckedMap;
}

function getModelsCheckedMap(modelsCoastersCount: Map<string, FilterResult>): Map<string, boolean> {
    const modelsCheckedMap = new Map<string, boolean>();

    for (const model of Array.from(modelsCoastersCount.keys())) {
        modelsCheckedMap.set(model, !['Junior Coaster', 'Kiddie Coaster', 'Family Coaster'].includes(model));
    }

    return modelsCheckedMap;
}

export default Filter;
