import { useEffect, useState } from 'react';
import SongGuitar from './Beastie Boys - Sabotage/guitar.ogg';
import SongBass from './Beastie Boys - Sabotage/rhythm.ogg';
import SongVocals from './Beastie Boys - Sabotage/vocals.ogg';
import SongDrums1 from './Beastie Boys - Sabotage/drums_1.ogg';
import SongDrums2 from './Beastie Boys - Sabotage/drums_2.ogg';
import SongDrums3 from './Beastie Boys - Sabotage/drums_3.ogg';
import SongBacking from './Beastie Boys - Sabotage/song.ogg';
import { Route, updateRoute } from '../../ui/Routing';

interface MusicPlayerProps { }

enum Player { PLAY, PAUSE }

const MusicPlayer: React.FC<MusicPlayerProps> = ({ }) => {
    const [player, setPlayer] = useState<Player>(Player.PAUSE);
    const [seconds, setSeconds] = useState(0);
    const [tracks, setTracks] = useState<HTMLAudioElement[]>([]);

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);

        Promise.all([
            loadAudio(SongGuitar),
            loadAudio(SongBass),
            loadAudio(SongVocals),
            loadAudio(SongDrums1),
            loadAudio(SongDrums2),
            loadAudio(SongDrums3),
            loadAudio(SongBacking)
        ]).then(laodedTracks => {
            console.log(performance.now(), 'All audio loaded');

            setTracks(laodedTracks);
        });
    }, []);

    const buttonText = player === Player.PAUSE ? 'Play' : 'Pause';

    return <div>
        <button onClick={() => temp(
            player,
            seconds,
            tracks,
            updatedPlayer => setPlayer(updatedPlayer),
            updatedSeconds => setSeconds(updatedSeconds)
        )}>{buttonText}</button>
    </div>;
};

function temp(
    player: Player,
    seconds: number,
    tracks: HTMLAudioElement[],
    setPlayer: (player: Player) => void,
    setSeconds: (seconds: number) => void
) {
    console.log(performance.now(), 'Play button pressed');

    if (player === Player.PAUSE) {
        for (const track of tracks) {
            track.currentTime = seconds;
            track.play();
        }

        setPlayer(Player.PLAY);
    } else if (player === Player.PLAY) {
        for (const track of tracks) {
            track.pause();
            setSeconds(track.currentTime);
        }

        setPlayer(Player.PAUSE);
    }
}

function loadAudio(src: string): Promise<HTMLAudioElement> {
    return new Promise(resolve => {
        const audio = new Audio(src);

        audio.addEventListener('canplaythrough', () => resolve(audio));
    });
}

export default MusicPlayer;
