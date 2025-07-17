import { Database } from "../../../util/database/Database";
import { ExampleTables } from "../../../util/database/DatabaseSchemas";
import { ExampleDatabase } from "../data/ExampleDatabase";

interface HomeProps {
    database: Database<ExampleTables>,
    exampleDatabase: ExampleDatabase;
}

const Home: React.FC<HomeProps> = ({ database, exampleDatabase }) => {
    const testGet = () => {
        database.get('numbers').then(numbers => {
            console.log('Numbers:', numbers)
        });

        database.get('words').then(words => {
            console.log('Words:', words)
        });
    };

    const testAdd = () => {
        database.add('numbers', { value: 42, description: 'The answer to life, the universe, and everything' })
        database.add('words', { name: 'Hello', definition: 'A greeting' });
    };

    const testDelete = () => {
        database.delete().then(() => {
            console.log('Database deleted successfully');
        });
    };

    return <div>
        <h1>Database Debug Home</h1>
        <h2>Output in console</h2>
        <button onClick={testGet}>Test Get</button>
        <br />
        <button onClick={testAdd}>Test Add</button>
        <br />
        <button onClick={testDelete}>Test Delete</button>
    </div>;
};

export default Home;
