import { useEffect, useRef, useState } from 'react';
import SongGuitar from './Beastie Boys - Sabotage/guitar.ogg';
import SongBass from './Beastie Boys - Sabotage/rhythm.ogg';
import SongVocals from './Beastie Boys - Sabotage/vocals.ogg';
import SongDrums1 from './Beastie Boys - Sabotage/drums_1.ogg';
import SongDrums2 from './Beastie Boys - Sabotage/drums_2.ogg';
import SongDrums3 from './Beastie Boys - Sabotage/drums_3.ogg';
import SongBacking from './Beastie Boys - Sabotage/song.ogg';
import { Route, updateRoute } from '../../ui/Routing';
import { selectFolder } from './Parser';

interface MusicPlayerProps { }

enum Player { PLAY, PAUSE }

const MusicPlayer: React.FC<MusicPlayerProps> = ({ }) => {
    const [player, setPlayer] = useState<Player>(Player.PAUSE);
    const [seconds, setSeconds] = useState(0);
    const [tracks, setTracks] = useState<HTMLAudioElement[]>([]);
    const [_, setForceRender] = useState(false);
    const tracksRef = useRef<HTMLAudioElement[]>([]);

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);

        const updateSliderInterval = setInterval(() => {
            setSeconds(tracksRef.current[0]?.currentTime ?? 0);
        }, 200);

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

    const rerender = () => {
        setForceRender(prev => !prev);
    };

    const soloTrack = (soloedtrack: HTMLAudioElement) => {
        for (const track of tracks) {
            track.muted = track !== soloedtrack;
        }

        rerender();
    };

    const allTracks = () => {
        for (const track of tracks) {
            track.muted = false;
        }

        rerender();
    };

    const trackCheckboxes = tracks.map((track, index) => {
        const trackName = ['Guitar', 'Bass', 'Vocals', 'Drums 1', 'Drums 2', 'Drums 3', 'Backing'][index];

        return trackCheckbox(index, track, trackName, () => soloTrack(track), rerender);
    });

    const buttonText = player === Player.PAUSE ? 'Play' : 'Pause';

    return <>
        <div style={{ position: 'fixed', right: '5px', top: '5px' }}>
            <button onClick={selectFolder} style={{ fontSize: '1.25em' }}>📁</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '25px', gap: '10px', fontSize: '2em', color: 'white' }}>
            <button style={{ fontSize: '1.7em', width: '5em', borderRadius: '50px', padding: '5px' }} onClick={onPlayButtonClick}>
                {buttonText}
            </button>

            {playerSlider(tracks, seconds, newSeconds => setSeconds(newSeconds))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button style={{ fontSize: '1em', marginBottom: '10px' }} onClick={allTracks}>All</button>
                {trackCheckboxes}
            </div>

        </div>
    </>;
};

function playerSlider(tracks: HTMLAudioElement[], seconds: number, updateSeconds: (seconds: number) => void): JSX.Element {
    return <input
        type="range"
        min={0}
        max={tracks[0]?.duration ?? 0}
        value={seconds}
        onChange={e => {
            const newSeconds = Number(e.target.value);
            updateSeconds(newSeconds);

            for (const track of tracks) {
                track.currentTime = newSeconds;
            }
        }}
        style={{ width: '350px' }}
    />;
}


function trackCheckbox(index: number, track: HTMLAudioElement, label: string, onSolo: () => void, renender: () => void): JSX.Element {
    return <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <input
            type='checkbox'
            onChange={e => {
                track.muted = !e.target.checked;
                renender();
            }}
            checked={!track.muted}
            style={{ transform: 'scale(2.5)' }}
        />
        <button style={{ width: '6em', fontSize: '1em' }} onClick={onSolo}>{label}</button>
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
