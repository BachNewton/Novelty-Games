import { useEffect, useRef, useState } from 'react';
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
    const tracksRef = useRef<HTMLAudioElement[]>([]);

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);

        const updateSliderInterval = setInterval(() => {
            setSeconds(tracksRef.current[0]?.currentTime ?? 0);
        }, 1000);

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
            tracksRef.current = laodedTracks;
        });

        return () => clearInterval(updateSliderInterval);
    }, []);

    const onPlayButtonClick = () => {
        playButtonClick(
            player,
            seconds,
            tracks,
            updatedPlayer => setPlayer(updatedPlayer),
            updatedSeconds => setSeconds(updatedSeconds)
        );
    };

    const buttonText = player === Player.PAUSE ? 'Play' : 'Pause';

    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '15px', gap: '10px', fontSize: '2em', color: 'white' }}>
        <button style={{ fontSize: '1.7em', width: '5em', borderRadius: '50px', padding: '5px' }} onClick={onPlayButtonClick}>
            {buttonText}
        </button>

        <input
            type="range"
            min={0}
            max={tracks[0]?.duration ?? 0}
            value={seconds}
            onChange={e => {
                const newSeconds = Number(e.target.value);
                setSeconds(newSeconds);

                for (const track of tracks) {
                    track.currentTime = newSeconds;
                }
            }}
            style={{ width: '350px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {trackCheckbox(tracks[0], 'Guitar')}
            {trackCheckbox(tracks[1], 'Bass')}
            {trackCheckbox(tracks[2], 'Vocals')}
            {trackCheckbox(tracks[3], 'Drums 1')}
            {trackCheckbox(tracks[4], 'Drums 2')}
            {trackCheckbox(tracks[5], 'Drums 3')}
            {trackCheckbox(tracks[6], 'Backing')}
        </div>

    </div>;
};

function trackCheckbox(track: HTMLAudioElement, label: string): JSX.Element {
    return <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <input
            type='checkbox'
            onChange={e => {
                track.muted = !e.target.checked;
            }}
            defaultChecked={true}
            style={{ transform: 'scale(2.5)' }}
        />
        <button style={{ width: '6em', fontSize: '1em' }}>{label}</button>
    </div>
}

function playButtonClick(
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
