import { useMemo } from 'react';
import { createWinterCyclingNetworking } from '../logic/WinterCyclingNetworking';
import Home from './Home';

const WinterCyclingPage: React.FC = () => {
    const networking = useMemo(() => createWinterCyclingNetworking(), []);

    return <Home networking={networking} />;
};

export default WinterCyclingPage;
