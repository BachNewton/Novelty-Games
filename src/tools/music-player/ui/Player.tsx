import { useEffect, useRef, useState } from "react";
import { SongPackage } from "../logic/MusicDatabase";
import { fileToAudio } from "../logic/Parser";

interface PlayerProps {
    song: SongPackage | null;
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

const Player: React.FC<PlayerProps> = ({ song }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [seconds, setSeconds] = useState(0);
    const [tracks, setTracks] = useState<Tracks | null>(null);
    const [_, setForceRender] = useState(false);
    const tracksRef = useRef<Tracks | null>(null);

    useEffect(() => {
        const updateSliderInterval = setInterval(() => {
            setSeconds(tracksRef?.current?.guitar?.currentTime ?? 0);
        }, 200);

        return () => clearInterval(updateSliderInterval);
    }, []);

    useEffect(() => {
        if (song === null) return;

        // Pause any previous tracks that might have been playing
        applyToTracks(audio => audio.pause(), tracks);
        setIsPlaying(false);
        setTracks(null);
        tracksRef.current = null;

        loadTracks(song).then(loadedTracks => {
            setTracks(loadedTracks);
            tracksRef.current = loadedTracks;
        });
    }, [song]);

    const icon = tracks === null ? '⏯️' : isPlaying ? '⏸️' : '▶️';

    const handleExpansion = (e: React.MouseEvent) => { if (e.target === e.currentTarget) setExpanded(!expanded) };

    const onPlayButtonClick = () => {
        if (tracks === null) return;

        setIsPlaying(!isPlaying);
        playButtonClick(!isPlaying, tracks);
    };

    const forceRender = () => setForceRender(prev => !prev);

    return <div style={{
        padding: '10px',
        borderTop: '3px solid var(--novelty-blue)',
        boxShadow: 'black 0px -10px 20px'
    }}>
        {expandedUi(expanded, tracks, handleExpansion, forceRender)}

        <div style={{ textAlign: 'center' }} onClick={handleExpansion}>{song?.folderName}</div>

        <div style={{ display: 'flex', justifyContent: 'center' }} onClick={handleExpansion}>
            {sliderUi(tracks, seconds, updatedSeconds => setSeconds(updatedSeconds))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', fontSize: '1.75em' }} onClick={handleExpansion}>
            <div style={{ cursor: 'pointer' }} onClick={onPlayButtonClick}>
                {icon}
            </div>
        </div>
    </div>;
};

async function loadTracks(song: SongPackage): Promise<Tracks> {
    const [guitar, bass, vocals, drums, drums1, drums2, drums3, keys, backing] = await Promise.all([
        fileToAudio(song.guitar),
        fileToAudio(song.bass),
        fileToAudio(song.vocals),
        fileToAudio(song.drums),
        fileToAudio(song.drums1),
        fileToAudio(song.drums2),
        fileToAudio(song.drums3),
        fileToAudio(song.keys),
        fileToAudio(song.backing)
    ]);

    console.log(performance.now(), 'Loaded: ' + song.folderName);

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

    return loadedTracks;
}

function sliderUi(tracks: Tracks | null, seconds: number, updateSeconds: (seconds: number) => void): JSX.Element {
    return <input
        type='range'
        min={0}
        max={tracks?.guitar?.duration ?? 0}
        value={seconds}
        onChange={e => {
            const newSeconds = Number(e.target.value);
            applyToTracks(audio => audio.currentTime = newSeconds, tracks);
            updateSeconds(newSeconds);
        }}
        style={{ width: '75%', cursor: 'pointer' }}
    />;
}

function expandedUi(
    expanded: boolean,
    tracks: Tracks | null,
    handleExpansion: (e: React.MouseEvent) => void,
    forceRender: () => void
): JSX.Element {
    if (!expanded || tracks === null) return <></>;

    const onSolo = (track: HTMLAudioElement) => {
        applyToTracks(audio => {
            if (audio === track) audio.muted = false;
            else audio.muted = true;
        }, tracks);

        forceRender();
    };

    const onAll = () => {
        applyToTracks(audio => audio.muted = false, tracks);
        forceRender();
    };

    const trackCheckboxFor = (track: HTMLAudioElement | null, name: string) => {
        if (track === null) return;
        return trackCheckbox(track, name, onSolo, handleExpansion);
    };

    return <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button style={{ fontSize: '1em', textAlign: 'left' }} onClick={onAll}>All</button>
        {trackCheckboxFor(tracks.guitar, 'Guitar')}
        {trackCheckboxFor(tracks.bass, 'Bass')}
        {trackCheckboxFor(tracks.vocals, 'Vocals')}
        {trackCheckboxFor(tracks.drums, 'Drums')}
        {trackCheckboxFor(tracks.drums1, 'Drums 1')}
        {trackCheckboxFor(tracks.drums2, 'Drums 2')}
        {trackCheckboxFor(tracks.drums3, 'Drums 3')}
        {trackCheckboxFor(tracks.keys, 'Keys')}
        {trackCheckboxFor(tracks.backing, 'Backing')}
    </div>;
}

function trackCheckbox(
    track: HTMLAudioElement,
    label: string,
    onSolo: (track: HTMLAudioElement) => void,
    handleExpansion: (e: React.MouseEvent) => void
): JSX.Element {
    return <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingLeft: '5px' }} onClick={handleExpansion}>
        <input
            type='checkbox'
            onChange={e => {
                track.muted = !e.target.checked;
            }}
            checked={!track.muted}
            style={{ transform: 'scale(2.5)' }}
        />
        <button style={{ width: '6em', fontSize: '1em' }} onClick={() => onSolo(track)}>{label}</button>
    </div>;
}

function playButtonClick(isPlaying: boolean, tracks: Tracks) {
    if (isPlaying) {
        applyToTracks(audio => audio.play(), tracks);
    } else {
        applyToTracks(audio => audio.pause(), tracks);
    }
}

function applyToTracks(apply: (audioElement: HTMLAudioElement) => void, tracks: Tracks | null) {
    if (tracks === null) return;

    const audioElements = [
        tracks.guitar,
        tracks.bass,
        tracks.vocals,
        tracks.drums,
        tracks.drums1,
        tracks.drums2,
        tracks.drums3,
        tracks.keys,
        tracks.backing
    ];

    for (const audioElement of audioElements) {
        if (audioElement !== null) apply(audioElement);
    }
}

export default Player;
