import { useMemo } from 'react';
import { createFreeMarketCommunicator } from '../logic/FreeMarketCommunicator';
import { createStorer, StorageKey } from '../../../util/Storage';
import { FreeMarketSave } from '../data/FreeMarketSave';
import FreeMarket from './FreeMarket';

const FreeMarketPage: React.FC = () => {
    const { communicator, storer } = useMemo(() => ({
        communicator: createFreeMarketCommunicator(),
        storer: createStorer<FreeMarketSave>(StorageKey.FREE_MARKET)
    }), []);

    return <FreeMarket communicator={communicator} storer={storer} />;
};

export default FreeMarketPage;
