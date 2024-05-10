import Rollercoaster from './Data';
import createQuestion from './QuestionCreator';

export default function fecthData(): Promise<string> {
    const URL = 'https://raw.githubusercontent.com/fabianrguez/rcdb-api/main/db/coasters.json';

    return fetch(URL).then(response => response.json()).then(json => {
        const rollercoasters = json as Array<Rollercoaster>;
        console.log('All Rollercoasters', rollercoasters);
        const filteredRollercoasters = filterCoasters(rollercoasters);
        console.log('Filtered Rollercoasters', filteredRollercoasters);

        const question = createQuestion(filteredRollercoasters);
        console.log(question);

        return 'Hello World!';
    });
}

function filterCoasters(coasters: Array<Rollercoaster>): Array<Rollercoaster> {
    return coasters.filter(coaster => {
        if (coaster.status.state !== 'Operating') return false;
        if (coaster.country !== 'United States') return false;
        if (['Junior Coaster', 'Kiddie Coaster', 'Family Coaster'].includes(coaster.model)) return false;

        return true;
    })
}
