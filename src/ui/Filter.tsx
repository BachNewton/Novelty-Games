import { useEffect, useState } from "react";
import '../css/Filter.css';
import { Rollercoaster } from "../logic/Data";

interface FilterProps {
    pendingCoasters: Promise<Array<Rollercoaster>>;
    onCancel: () => void;
    onConfirm: () => void;
}

interface State {
    coasters: Array<Rollercoaster>;
    ui: UiState;
    countriesCheckedMap: Map<string, boolean>;
    countriesCoastersCount: Map<string, number>;
}

enum UiState {
    LOADING,
    FILTER
}

const Filter: React.FC<FilterProps> = ({ pendingCoasters, onCancel, onConfirm }) => {
    const [state, setState] = useState({ ui: UiState.LOADING } as State);

    useEffect(() => {
        pendingCoasters.then(readyCoasters => {
            state.coasters = readyCoasters;
            state.countriesCoastersCount = getCountriesCoastersCount(readyCoasters);
            state.countriesCheckedMap = getCountriesCheckedMap(state.countriesCoastersCount);
            state.ui = UiState.FILTER;
            setState({ ...state });
        });
    }, [pendingCoasters]);

    return <div className="Filter">{Ui(state, setState, onCancel, onConfirm)}</div>;
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
            const before = state.countriesCheckedMap.get(country) === true;
            state.countriesCheckedMap.set(country, !before);
            setState({ ...state });
        };

        return <tr key={index}>
            <td><input type="checkbox" checked={state.countriesCheckedMap.get(country)} onChange={onChange} /></td>
            <td>{country}</td>
            <td>{coastersCount}</td>
        </tr>
    });

    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button style={{ position: 'fixed', left: '0.25em' }} onClick={onCancel}>Cancel ❌</button>
        <button style={{ position: 'fixed', right: '0.25em' }}>Confirm ✅</button>
        <h1>Coaster Filters</h1>
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
        const country = coaster.country === '' ? 'Unknown' : coaster.country;
        const count = countriesCoastersCount.get(country);
        countriesCoastersCount.set(country, count === undefined ? 1 : count + 1);
    }

    return countriesCoastersCount;
}

function getCountriesCheckedMap(countriesCoastersCount: Map<string, number>): Map<string, boolean> {
    const countriesCheckedMap = new Map<string, boolean>();

    for (const country of Array.from(countriesCoastersCount.keys())) {
        countriesCheckedMap.set(country, true); // Default all filters to enabled
    }

    return countriesCheckedMap;
}

export default Filter;
