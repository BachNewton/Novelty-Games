import { Rollercoaster } from './Data';
import createQuestion from './QuestionCreator';

export default function fecthData(): Promise<Array<Rollercoaster>> {
    // Alernative API: https://rcdb-api.vercel.app/api/coasters
    const URL = 'https://raw.githubusercontent.com/fabianrguez/rcdb-api/main/db/coasters.json';

    return fetch(URL).then(response => response.json()).then(json => {
        const rollercoasters = json as Array<Rollercoaster>;
        console.log('All Rollercoasters', rollercoasters);
        const filteredRollercoasters = filterCoasters(rollercoasters);
        console.log('Filtered Rollercoasters', filteredRollercoasters);

        return filteredRollercoasters;
    });
}

function filterCoasters(coasters: Array<Rollercoaster>): Array<Rollercoaster> {
    return coasters.filter(coaster => {
        if (coaster.status.state !== 'Operating') return false;
        if (coaster.country !== 'United States') return false;
        if (['Junior Coaster', 'Kiddie Coaster', 'Family Coaster'].includes(coaster.model)) return false;
        if (coaster.park.name == undefined) console.log(coaster);

        return true;
    })
}
