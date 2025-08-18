import { useState } from "react";
import { Database } from "../../../util/database/v1/Database";
import { ExampleTables } from "../../../util/database/v1/DatabaseSchemas";
import Button from "../../../util/ui/Button";
import { ExampleDatabase } from "../data/ExampleDatabase";

interface HomeProps {
    database: Database<ExampleTables>,
    exampleDatabase: ExampleDatabase;
}

const Home: React.FC<HomeProps> = ({ database, exampleDatabase }) => {
    const [text, setText] = useState('');

    const testGetAll_v1 = () => {
        database.getAll('numbers').then(numbers => {
            console.log('Numbers:', numbers)
        });

        database.getAll('words').then(words => {
            console.log('Words:', words)
        });
    };

    const testAdd_v1 = () => {
        database.add('numbers', { value: 42, description: 'The answer to life, the universe, and everything' }).then(() => console.log('Added numbers'));
        database.add('words', { name: 'Hello', definition: 'A greeting' }).then(() => console.log('Added words'));
    };

    const testAddMultiple_v1 = () => {
        database.addAll('numbers', [
            { value: 1, description: 'The number one' },
            { value: 2, description: 'The number two' },
            { value: 3, description: 'The number three' },
            { value: 4, description: 'The number four' },
            { value: 5, description: 'The number five' }
        ]).then(() => console.log('Added 5 numbers'));
    };

    const testAddText_v1 = () => {
        database.add('words', { name: text, definition: 'Custom text' }).then(() => console.log('Added custom text'));
    };

    const testDeleteText_v1 = () => {
        database.deleteRow('words', data => data.name === text)
            .then((data) => console.log('Deleted:', data))
            .catch(() => console.warn('Failed to deleted!'));
    };

    const testDeleteTable_v1 = () => {
        database.deleteTable('numbers').then(() => {
            console.log('Numbers table deleted successfully');
        });
    };

    const testDelete_v1 = () => {
        database.delete().then(() => {
            console.log('Database deleted successfully');
        });
    };

    const testGetAll_v2 = () => {
        exampleDatabase.cars.getAll().then(cars => console.log('Cars:', cars));
        exampleDatabase.computers.getAll().then(computers => console.log('Computers:', computers));
        exampleDatabase.offices.getAll().then(offices => console.log('Offices:', offices));
        exampleDatabase.people.getAll().then(people => console.log('People:', people));
    };

    const testAdd_v2 = () => {
        exampleDatabase.cars.add({ make: 'Ford', year: 2013 }).then(() => console.log('Added car'));
        exampleDatabase.computers.add({ brand: 'Dell', cpu: 'intel' }).then(() => console.log('Added computer'));
        exampleDatabase.offices.add({ location: 'Helsinki', headcount: 50 }).then(() => console.log('Added office'));
        exampleDatabase.people.add({ firstName: 'Landon', lastName: 'Smith' }).then(() => console.log('Added person'));
    };

    const testDelete_v2 = () => {
        exampleDatabase.delete().then(() => {
            console.log('Database deleted successfully');
        });
    };

    return <div style={{ margin: '15px', fontSize: '1.3em' }}>
        <h1>Database Debug</h1>
        <h2>Output in console</h2>

        <h3>V1</h3>
        <Button onClick={testGetAll_v1}>Test Get All</Button>
        <br />
        <Button onClick={testAdd_v1}>Test Add</Button>
        <Button onClick={testAddMultiple_v1}>Test Add 5x</Button>
        <br />
        <Button onClick={testAddText_v1}>Test Add Text</Button>
        <Button onClick={testDeleteText_v1}>Test Delete Text</Button>
        <input placeholder='Text' onChange={e => setText(e.target.value)} />
        <br />
        <Button onClick={testDeleteTable_v1}>Test Delete Numbers Table</Button>
        <br />
        <Button onClick={testDelete_v1}>Test Delete Database</Button>

        <h3>V2</h3>
        <Button onClick={testGetAll_v2}>Test Get All</Button>
        <br />
        <Button onClick={testAdd_v2}>Test Add</Button>
        <br />
        <Button onClick={testDelete_v2}>Test Delete</Button>
    </div>;
};

export default Home;
