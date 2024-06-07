import { useEffect, useState } from "react";
import '../css/Filter.css';
import { Rollercoaster } from "../logic/Data";
import { RollercoasterFilter, baseFilter, loadFilter, saveFilter } from "../logic/FilterRepo";

interface FilterProps {
    pendingCoasters: Promise<Array<Rollercoaster>>;
    onCancel: () => void;
    onConfirm: (rollercoasterFilter: RollercoasterFilter) => void;
}

interface State {
    coasters: Array<Rollercoaster>;
    ui: UiState;
    countriesCoastersCount: Map<string, number>;
    rollercoasterFilter: RollercoasterFilter;
}

enum UiState {
    LOADING,
    FILTER
}

const Filter: React.FC<FilterProps> = ({ pendingCoasters, onCancel, onConfirm }) => {
    const [state, setState] = useState({ ui: UiState.LOADING } as State);

    useEffect(() => {
        pendingCoasters.then(readyCoasters => {
            const coasters = baseFilter(readyCoasters);

            state.coasters = coasters;
            state.countriesCoastersCount = getCountriesCoastersCount(coasters);

            const filter = loadFilter();
            state.rollercoasterFilter = filter === null ? getAndSaveDefaultFilter(state.countriesCoastersCount) : filter;

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
    const countriesCoastersCountUi = Array.from(state.countriesCoastersCount).sort((a, b) => b[1] - a[1]).map((countryCoasterCount, index) => {
        const country = countryCoasterCount[0];
        const coastersCount = countryCoasterCount[1];

        const onChange = () => {
            const before = state.rollercoasterFilter.countries.get(country) === true;
            state.rollercoasterFilter.countries.set(country, !before);
            setState({ ...state });
        };

        return <tr key={index}>
            <td><input type="checkbox" checked={state.rollercoasterFilter.countries.get(country)} onChange={onChange} /></td>
            <td>{country}</td>
            <td>{coastersCount}</td>
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

function getCountriesCoastersCount(coasters: Array<Rollercoaster>) {
    const countriesCoastersCount = new Map<string, number>();

    for (const coaster of coasters) {
        const count = countriesCoastersCount.get(coaster.country);
        countriesCoastersCount.set(coaster.country, count === undefined ? 1 : count + 1);
    }

    return countriesCoastersCount;
}

function getAndSaveDefaultFilter(countriesCoastersCount: Map<string, number>): RollercoasterFilter {
    const rollercoasterFilter = { countries: getCountriesCheckedMap(countriesCoastersCount) } as RollercoasterFilter;

    saveFilter(rollercoasterFilter);

    return rollercoasterFilter;
}

function getCountriesCheckedMap(countriesCoastersCount: Map<string, number>): Map<string, boolean> {
    const countriesCheckedMap = new Map<string, boolean>();

    for (const country of Array.from(countriesCoastersCount.keys())) {
        countriesCheckedMap.set(country, country === 'United States'); // Default only USA enabled
    }

    return countriesCheckedMap;
}

export default Filter;
