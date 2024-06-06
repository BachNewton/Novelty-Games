import { useEffect, useState } from "react";
import '../css/Filter.css';
import { Rollercoaster } from "../logic/Data";

interface FilterProps {
    pendingCoasters: Promise<Array<Rollercoaster>>;
    onDone: () => void;
}

interface State {
    countriesCheckedMap: Map<string, boolean>;
    coasters: Array<Rollercoaster>;
    ui: UiState;
}

enum UiState {
    LOADING,
    FILTER
}

const Filter: React.FC<FilterProps> = ({ pendingCoasters }) => {
    const [state, setState] = useState({ ui: UiState.LOADING } as State);

    useEffect(() => {
        pendingCoasters.then(readyCoasters => {
            state.coasters = readyCoasters;
            state.countriesCheckedMap = new Map();
            state.ui = UiState.FILTER;
            setState({ ...state });
        });
    }, [pendingCoasters]);

    return <div className="Filter">{Ui(state, setState)}</div>;
};

function Ui(state: State, setState: React.Dispatch<React.SetStateAction<State>>) {
    switch (state.ui) {
        case UiState.LOADING:
            return LoadingUi();
        case UiState.FILTER:
            return FilterUi(state, setState);
    }
}

function LoadingUi() {
    return <p>Loading...</p>;
}

function FilterUi(state: State, setState: React.Dispatch<React.SetStateAction<State>>) {
    const countriesCoastersCount = getCountriesCheckedMap(state.coasters);

    const countriesCoastersCountUi = Array.from(countriesCoastersCount).sort((a, b) => b[1] - a[1]).map((countryCoasterCount, index) => {
        const country = countryCoasterCount[0];
        const coastersCount = countryCoasterCount[1];

        const onClick = () => {
            const before = state.countriesCheckedMap.get(country) === true;
            state.countriesCheckedMap.set(country, !before);
            setState({ ...state });
        };

        return <tr key={index}>
            <td><input type="checkbox" checked={state.countriesCheckedMap.get(country)} onClick={onClick} /></td>
            <td>{country}</td>
            <td>{coastersCount}</td>
        </tr>
    });

    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1>Coaster Filters</h1>
        <table style={{ textAlign: 'left' }}>
            <tr>
                <th></th>
                <th>Country</th>
                <th>Coaster Count</th>
            </tr>
            {countriesCoastersCountUi}
        </table>
    </div>;
}

function getCountriesCheckedMap(coasters: Array<Rollercoaster>) {
    const countriesCoastersCount = new Map<string, number>();

    for (const coaster of coasters) {
        const country = coaster.country === '' ? 'Unknown' : coaster.country;
        const count = countriesCoastersCount.get(country);
        countriesCoastersCount.set(country, count === undefined ? 1 : count + 1);
    }

    return countriesCoastersCount;
}

export default Filter;
