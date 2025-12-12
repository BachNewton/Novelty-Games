import { useMemo } from 'react';
import { createPetsDatabase } from '../logic/PetsDatabase';
import Home from './Home';

const PetsPage: React.FC = () => {
    const database = useMemo(() => createPetsDatabase(), []);

    return <Home database={database} />;
};

export default PetsPage;
