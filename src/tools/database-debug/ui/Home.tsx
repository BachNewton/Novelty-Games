import { useState } from "react";
import { Database } from "../../../util/database/Database";
import { ExampleTables } from "../../../util/database/DatabaseSchemas";
import Button from "../../../util/ui/Button";

interface HomeProps {
    database: Database<ExampleTables>;
}

const Home: React.FC<HomeProps> = ({ database }) => {
    const [text, setText] = useState('');

    const testGetAll = () => {
        database.getAll('numbers').then(numbers => {
            console.log('Numbers:', numbers)
        });

        database.getAll('words').then(words => {
            console.log('Words:', words)
        });
    };

    const testAdd = () => {
        database.add('numbers', { value: 42, description: 'The answer to life, the universe, and everything' }).then(() => console.log('Added numbers'));
        database.add('words', { name: 'Hello', definition: 'A greeting' }).then(() => console.log('Added words'));
    };

    const testAddMultiple = () => {
        database.addAll('numbers', [
            { value: 1, description: 'The number one' },
            { value: 2, description: 'The number two' },
            { value: 3, description: 'The number three' },
            { value: 4, description: 'The number four' },
            { value: 5, description: 'The number five' }
        ]).then(() => console.log('Added 5 numbers'));
    };

    const testAddText = () => {
        database.add('words', { name: text, definition: 'Custom text' }).then(() => console.log('Added custom text'));
    };

    const testDeleteText = () => {
        database.deleteRow('words', data => data.name === text)
            .then((data) => console.log('Deleted:', data))
            .catch(() => console.warn('Failed to deleted!'));
    };

    const testDeleteTable = () => {
        database.deleteTable('numbers').then(() => {
            console.log('Numbers table deleted successfully');
        });
    };

    const testDelete = () => {
        database.delete().then(() => {
            console.log('Database deleted successfully');
        });
    };


    return <div style={{ margin: '15px', fontSize: '1.3em' }}>
        <h1>Database Debug</h1>
        <h2>Output in console</h2>

        <Button onClick={testGetAll}>Test Get All</Button>
        <br />
        <Button onClick={testAdd}>Test Add</Button>
        <Button onClick={testAddMultiple}>Test Add 5x</Button>
        <br />
        <Button onClick={testAddText}>Test Add Text</Button>
        <Button onClick={testDeleteText}>Test Delete Text</Button>
        <input placeholder='Text' onChange={e => setText(e.target.value)} />
        <br />
        <Button onClick={testDeleteTable}>Test Delete Numbers Table</Button>
        <br />
        <Button onClick={testDelete}>Test Delete Database</Button>
    </div>;
};

export default Home;
