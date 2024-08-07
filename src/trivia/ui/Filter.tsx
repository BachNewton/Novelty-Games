import { useEffect, useState } from "react";
import '../css/Filter.css';
import { Rollercoaster } from "../data/Data";
import { FilterAndPropertyGetter, FilterResult, RollercoasterFilter, baseFilter, filterByProperties, getFilter } from "../logic/FilterRepo";

interface FilterProps {
    pendingCoasters: Promise<Array<Rollercoaster>>;
    onCancel: () => void;
    onConfirm: (rollercoasterFilter: RollercoasterFilter) => void;
}

interface FilterSection {
    getFilter: (filter: RollercoasterFilter) => Map<string, boolean>;
    getProperty: (coaster: Rollercoaster) => string;
    name: string;
}

interface FilterSectionUi {
    rows: JSX.Element[];
    name: string;
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

const Filter: React.FC<FilterProps> = ({ pendingCoasters, onCancel, onConfirm }) => {
    const [state, setState] = useState({ ui: UiState.LOADING } as State);

    useEffect(() => {
        pendingCoasters.then(readyCoasters => {
            state.allCoasters = readyCoasters;
            state.filteredCoasters = baseFilter(readyCoasters);
            console.log('Base filtered coasters', state.filteredCoasters);

            state.rollercoasterFilter = getFilter(state.allCoasters, state.filteredCoasters);

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

    const filterSections: Array<FilterSection> = [
        { name: 'Model', getFilter: filter => filter.models, getProperty: coaster => coaster.model },
        { name: 'Country', getFilter: filter => filter.countries, getProperty: coaster => coaster.country },
        { name: 'Park', getFilter: filter => filter.parks, getProperty: coaster => coaster.park.name }
    ];

    const filterSectionsUi: Array<FilterSectionUi> = filterSections.map(filterSection => {
        const filtersAndPropertyGetters: Array<FilterAndPropertyGetter> = filterSections.filter(it => it !== filterSection).map(it => {
            return { filter: it.getFilter(state.rollercoasterFilter), getProperty: it.getProperty };
        });

        const sectionFilteredCoasters = filterByProperties(state.filteredCoasters, filtersAndPropertyGetters);
        const sectionCoasterCount = getCoasterCountBasedOnProperty(state.allCoasters, sectionFilteredCoasters, filterSection.getProperty);

        return {
            name: filterSection.name,
            rows: Array.from(sectionCoasterCount).sort(sorter).map((coasterCount, index) => {
                const section = coasterCount[0];
                const filerResult = coasterCount[1];
                const filter = filterSection.getFilter(state.rollercoasterFilter);

                const onChange = () => {
                    const before = filter.get(section) === true;
                    filter.set(section, !before);
                    setState({ ...state });
                };

                return <tr key={index}>
                    <td><input type="checkbox" checked={filter.get(section)} onChange={onChange} /></td>
                    <td>{section}</td>
                    <td>{filerResult.after} <span className="before-filter">{filerResult.before}</span></td>
                </tr>
            })
        }
    });

    const filterSectionTables = filterSectionsUi.map((filterSectionUi, index) => {
        const className = index === filterSectionsUi.length - 1 ? '' : 'bottom-border';

        return <table key={index} className={className} style={{ textAlign: 'left', paddingBottom: '2em' }}>
            <thead>
                <tr>
                    <th></th>
                    <th>{filterSectionUi.name}</th>
                    <th>Coaster Count</th>
                </tr>
            </thead>
            <tbody>{filterSectionUi.rows}</tbody>
        </table>
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
            </ul>
        </div>
        {filterSectionTables}
    </div>;
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

export default Filter;
