import { useMemo } from 'react';
import { createLabyrinthCommunicator } from '../logic/LabyrinthCommunicator';
import Labyrinth from './Labyrinth';

const LabyrinthPage: React.FC = () => {
    const communicator = useMemo(() => createLabyrinthCommunicator(), []);

    return <Labyrinth communicator={communicator} />;
};

export default LabyrinthPage;
