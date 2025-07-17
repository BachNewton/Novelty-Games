import { Database } from "../../../util/database/v1/Database";
import { ExampleTables } from "../../../util/database/v1/DatabaseSchemas";
import Button from "../../../util/ui/Button";
import { ExampleDatabase } from "../data/ExampleDatabase";

interface HomeProps {
    database: Database<ExampleTables>,
    exampleDatabase: ExampleDatabase;
}

const Home: React.FC<HomeProps> = ({ database, exampleDatabase }) => {
    const testGet_v1 = () => {
        database.get('numbers').then(numbers => {
            console.log('Numbers:', numbers)
        });

        database.get('words').then(words => {
            console.log('Words:', words)
        });
    };

    const testAdd_v1 = () => {
        database.add('numbers', { value: 42, description: 'The answer to life, the universe, and everything' }).then(() => console.log('Added numbers'));
        database.add('words', { name: 'Hello', definition: 'A greeting' }).then(() => console.log('Added words'));
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
        <Button onClick={testGet_v1}>Test Get</Button>
        <br />
        <Button onClick={testAdd_v1}>Test Add</Button>
        <br />
        <Button onClick={testDelete_v1}>Test Delete</Button>

        <h3>V2</h3>
        <Button onClick={testGetAll_v2}>Test Get All</Button>
        <br />
        <Button onClick={testAdd_v2}>Test Add</Button>
        <br />
        <Button onClick={testDelete_v2}>Test Delete</Button>
    </div>;
};

export default Home;
