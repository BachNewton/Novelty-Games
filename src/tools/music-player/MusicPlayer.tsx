import { useEffect } from 'react';
import SongGuitar from './Beastie Boys - Sabotage/guitar.ogg';
import SongBass from './Beastie Boys - Sabotage/rhythm.ogg';
import { Route, updateRoute } from '../../ui/Routing';

interface MusicPlayerProps { }

const MusicPlayer: React.FC<MusicPlayerProps> = ({ }) => {
    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);
    }, []);

    return <div>
        <button onClick={temp}>Play</button>
    </div>;
};

function temp() {
    console.log('PLaying song');
    const auido = new Audio(SongGuitar)
    auido.addEventListener('canplaythrough', () => {
        console.log('Audio loaded');
    });
    auido.currentTime = 11;
    auido.play();
}

export default MusicPlayer;
