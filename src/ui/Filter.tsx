import { useState } from "react";
import { Rollercoaster } from "../logic/Data";

interface FilterProps {
    coasters: Array<Rollercoaster>;
}

const Filter: React.FC<FilterProps> = ({ coasters }) => {
    const [countriesCheckedMap, setCountriesCheckedMap] = useState(new Map<string, boolean>);

    const countriesCoastersCount = new Map<string, number>();
    for (const coaster of coasters) {
        const country = coaster.country === '' ? 'Unknown' : coaster.country;
        const count = countriesCoastersCount.get(country);
        countriesCoastersCount.set(country, count === undefined ? 1 : count + 1);
    }

    const countriesCoastersCountUi = Array.from(countriesCoastersCount).sort((a, b) => b[1] - a[1]).map((countryCoasterCount, index) => {
        const country = countryCoasterCount[0];
        const coastersCount = countryCoasterCount[1];

        const onClick = () => {
            const before = countriesCheckedMap.get(country) === true;
            countriesCheckedMap.set(country, !before);
            setCountriesCheckedMap(countriesCheckedMap);
        };

        return <tr key={index}>
            <td><input type="checkbox" checked={countriesCheckedMap.get(country)} onClick={onClick} /></td>
            <td>{country}</td>
            <td>{coastersCount}</td>
        </tr>
    });

    return <div>
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
};

export default Filter;
