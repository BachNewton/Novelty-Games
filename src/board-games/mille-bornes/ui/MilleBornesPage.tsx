import { useMemo } from 'react';
import { NewtorkCommunicator as MilleBornesNetworkCommunicator } from '../logic/NewtorkCommunicator';
import Home from './Home';

const MilleBornesPage: React.FC = () => {
    const communicator = useMemo(() => new MilleBornesNetworkCommunicator(), []);

    return <Home communicator={communicator} />;
};

export default MilleBornesPage;
