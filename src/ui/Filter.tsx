import { useEffect, useState } from "react";
import '../css/Filter.css';
import { Rollercoaster } from "../logic/Data";
import { RollercoasterFilter, baseFilter, filter, loadFilter, saveFilter } from "../logic/FilterRepo";

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
            const countriesCheckedMap = getCountriesCheckedMap(getCountriesCoastersCount(state.allCoasters, state.filteredCoasters));
            state.rollercoasterFilter = filter === null ? getAndSaveDefaultFilter(countriesCheckedMap) : filter;

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
    const countriesCoastersCountUi = Array.from(getCountriesCoastersCount(state.allCoasters, state.filteredCoasters)).sort((a, b) => b[1].after - a[1].after).map((countryCoasterCount, index) => {
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
                <li>Exclude 'Junior Coaster', 'Kiddie Coaster', and 'Family Coaster' coaster models</li>
                <li>Exclude Wiegand coaster maker</li>
                <li>Exclude all parks with 1 coaster or less</li>
                <li>Exclude all parks with 'Pizza' in the name</li>
                <li>Exclude all parks with 'Farm' in the name, except "Knott's Berry Farm"</li>
            </ul>
        </div>
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
    const countriesCoastersCount = new Map<string, FilterResult>();

    for (const coaster of allCoasters) {
        const filterResult = countriesCoastersCount.get(coaster.country);
        countriesCoastersCount.set(coaster.country, { before: (filterResult?.before || 0) + 1, after: filterResult?.after || 0 });
    }

    for (const coaster of filteredCoasters) {
        const filterResult = countriesCoastersCount.get(coaster.country);
        countriesCoastersCount.set(coaster.country, { before: filterResult?.before || 0, after: (filterResult?.after || 0) + 1 });
    }

    return countriesCoastersCount;
}

function getAndSaveDefaultFilter(countriesCheckedMap: Map<string, boolean>): RollercoasterFilter {
    const rollercoasterFilter = { countries: countriesCheckedMap } as RollercoasterFilter;

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

export default Filter;
