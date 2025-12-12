import { useMemo } from 'react';
import { createNetworkService, NetworkedApplication } from '../../../util/networking/NetworkService';
import Home from './Home';
import { MusicIndex } from '../logic/MusicIndex';

const MusicPlayerPage: React.FC = () => {
    const { networkService, musicIndexPromise } = useMemo(() => ({
        networkService: createNetworkService<void>(NetworkedApplication.MUSIC_PLAYER),
        musicIndexPromise: new Promise<MusicIndex>((resolve) => {
            import(/* webpackChunkName: "MusicIndex" */ '../logic/MusicIndex')
                .then(({ createMusicIndex }) => {
                    console.log('Loaded the MusicIndex module');
                    resolve(createMusicIndex());
                });
        })
    }), []);

    return <Home networkService={networkService} musicIndexPromise={musicIndexPromise} />;
};

export default MusicPlayerPage;
