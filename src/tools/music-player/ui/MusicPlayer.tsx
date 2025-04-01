import { useEffect, useRef, useState } from 'react';
import { Route, updateRoute } from '../../../ui/Routing';
import { fileToAudio, SongPackage } from '../logic/Parser';

interface MusicPlayerProps {
    songPackage?: SongPackage;
    onFolderSelect: () => void;
}

interface Tracks {
    guitar: HTMLAudioElement;
    bass: HTMLAudioElement;
    vocals: HTMLAudioElement;
    drums: HTMLAudioElement | null;
    drums1: HTMLAudioElement | null;
    drums2: HTMLAudioElement | null;
    drums3: HTMLAudioElement | null;
    keys: HTMLAudioElement | null;
    backing: HTMLAudioElement;
}

enum Player { PLAY, PAUSE }

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songPackage, onFolderSelect }) => {
    const [player, setPlayer] = useState<Player>(Player.PAUSE);
    const [seconds, setSeconds] = useState(0);
    const [tracks, setTracks] = useState<Tracks | null>(null);
    const [_, setForceRender] = useState(false);
    const tracksRef = useRef<Tracks | null>(null);

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);

        const updateSliderInterval = setInterval(() => {
            setSeconds(tracks?.guitar?.currentTime ?? 0);
        }, 200);

        if (songPackage !== undefined) {
            Promise.all([
                fileToAudio(songPackage.guitar),
                fileToAudio(songPackage.bass),
                fileToAudio(songPackage.vocals),
                fileToAudio(songPackage.drums),
                fileToAudio(songPackage.drums1),
                fileToAudio(songPackage.drums2),
                fileToAudio(songPackage.drums3),
                fileToAudio(songPackage.keys),
                fileToAudio(songPackage.backing)
            ]).then(([guitar, bass, vocals, drums, drums1, drums2, drums3, keys, backing]) => {
                console.log(performance.now(), 'All audio loaded');

                const loadedTracks: Tracks = {
                    guitar: guitar as HTMLAudioElement,
                    bass: bass as HTMLAudioElement,
                    vocals: vocals as HTMLAudioElement,
                    drums: drums as HTMLAudioElement,
                    drums1: drums1 as HTMLAudioElement,
                    drums2: drums2 as HTMLAudioElement,
                    drums3: drums3 as HTMLAudioElement,
                    keys: keys as HTMLAudioElement,
                    backing: backing as HTMLAudioElement
                };

                setTracks(loadedTracks);
                tracksRef.current = loadedTracks;
            });
        }

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
        // for (const track of tracks) {
        //     track.muted = track !== soloedtrack;
        // }

        rerender();
    };

    const allTracks = () => {
        // for (const track of tracks) {
        //     track.muted = false;
        // }

        rerender();
    };

    const trackCheckboxes: JSX.Element[] = [];
    // tracks.map((track, index) => {
    //     const trackName = ['Guitar', 'Bass', 'Vocals', 'Drums 1', 'Drums 2', 'Drums 3', 'Backing'][index];

    //     return trackCheckbox(index, track, trackName, () => soloTrack(track), rerender);
    // });

    const buttonText = player === Player.PAUSE ? 'Play' : 'Pause';

    return <>
        <div style={{ position: 'fixed', right: '5px', top: '5px' }}>
            <button onClick={onFolderSelect} style={{ fontSize: '1.25em' }}>📁</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '25px', gap: '10px', fontSize: '2em', color: 'white' }}>
            <div>{songPackage?.folderName}</div>
            <button style={{ fontSize: '1.7em', width: '5em', borderRadius: '50px', padding: '5px' }} onClick={onPlayButtonClick}>
                {buttonText}
            </button>

            {/* {playerSlider(tracks, seconds, newSeconds => setSeconds(newSeconds))} */}

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
    tracks: Tracks | null,
    setPlayer: (player: Player) => void,
    setSeconds: (seconds: number) => void
) {
    console.log(performance.now(), 'Play button pressed');

    if (tracks === null) return;

    if (player === Player.PAUSE) {
        tracks.guitar.currentTime = seconds;
        tracks.bass.currentTime = seconds;
        tracks.vocals.currentTime = seconds;
        tracks.backing.currentTime = seconds;
        if (tracks.drums) tracks.drums.currentTime = seconds;
        if (tracks.drums1) tracks.drums1.currentTime = seconds;
        if (tracks.drums2) tracks.drums2.currentTime = seconds;
        if (tracks.drums3) tracks.drums3.currentTime = seconds;
        if (tracks.keys) tracks.keys.currentTime = seconds;

        tracks.guitar.play();
        tracks.bass.play();
        tracks.vocals.play();
        tracks.backing.play();
        if (tracks.drums) tracks.drums.play();
        if (tracks.drums1) tracks.drums1.play();
        if (tracks.drums2) tracks.drums2.play();
        if (tracks.drums3) tracks.drums3.play();
        if (tracks.keys) tracks.keys.play();

        setPlayer(Player.PLAY);
    } else if (player === Player.PLAY) {
        tracks.guitar.pause();
        tracks.bass.pause();
        tracks.vocals.pause();
        tracks.backing.pause();
        if (tracks.drums) tracks.drums.pause();
        if (tracks.drums1) tracks.drums1.pause();
        if (tracks.drums2) tracks.drums2.pause();
        if (tracks.drums3) tracks.drums3.pause();
        if (tracks.keys) tracks.keys.pause();

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
