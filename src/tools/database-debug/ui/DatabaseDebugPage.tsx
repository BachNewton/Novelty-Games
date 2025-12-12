import { useMemo } from 'react';
import { createDatabase } from '../../../util/database/DatabaseImpl';
import Home from './Home';

const DatabaseDebugPage: React.FC = () => {
    const database = useMemo(() => createDatabase('example', ['numbers', 'words']), []);

    return <Home database={database} />;
};

export default DatabaseDebugPage;
