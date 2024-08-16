import { useState } from "react";
import '../css/Filter.css';
import { Rollercoaster } from "../data/Data";
import { FilterAndPropertyGetter, FilterResult, RollercoasterFilter, baseFilter, filterByProperties, getFilter } from "../logic/FilterRepo";

interface FilterProps {
    coasters: Array<Rollercoaster>;
    rollercoasterFilterGetter: RollercoasterFilterGetter;
}

export interface RollercoasterFilterGetter {
    get: (() => RollercoasterFilter) | null;
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
    rollercoasterFilter: RollercoasterFilter;
}

function getInitState(coasters: Array<Rollercoaster>): State {
    const filteredCoasters = baseFilter(coasters);
    console.log('Base filtered coasters', filteredCoasters);

    return {
        allCoasters: coasters,
        filteredCoasters: filteredCoasters,
        rollercoasterFilter: getFilter(coasters, filteredCoasters)
    };
}

const Filter: React.FC<FilterProps> = ({ coasters, rollercoasterFilterGetter }) => {
    const [state, setState] = useState<State>(getInitState(coasters));

    rollercoasterFilterGetter.get = () => state.rollercoasterFilter;

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
