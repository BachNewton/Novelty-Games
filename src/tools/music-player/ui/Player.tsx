import { useEffect, useState } from "react";
import { ParsedSong, Tracks } from "../logic/SongParser";

const SLIDER_UPDATE_INTERVAL = 200;

interface PlayerProps {
    parsedSong: ParsedSong | null;
}

const Player: React.FC<PlayerProps> = ({ parsedSong }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [seconds, setSeconds] = useState(0);
    const [tracks, setTracks] = useState<Tracks | null>(null);
    const [_, setForceRender] = useState(false);

    useEffect(() => {
        const updateSliderInterval = setInterval(() => {
            setSeconds(tracks?.backing?.currentTime ?? 0);
        }, SLIDER_UPDATE_INTERVAL);

        return () => clearInterval(updateSliderInterval);
    }, [tracks]);

    useEffect(() => {
        applyToTracks(audio => audio.pause(), tracks);
        setTracks(null);
        setIsPlaying(false);

        parsedSong?.tracksPromise.then(loadedTracks => {
            setTracks(loadedTracks);
            applyToTracks(audio => audio.play(), loadedTracks);
            setIsPlaying(true);
            setSeconds(0);
        });
    }, [parsedSong]);

    const icon = tracks === null ? '⏯️' : isPlaying ? '⏸️' : '▶️';

    const handleExpansion = (e: React.MouseEvent) => { if (e.target === e.currentTarget) setIsExpanded(!isExpanded) };

    const onPlayButtonClick = () => {
        if (tracks === null) return;

        setIsPlaying(!isPlaying);
        playButtonClick(!isPlaying, tracks);
    };

    const forceRender = () => setForceRender(prev => !prev);

    return <div>
        {expandedUi(isExpanded, tracks, handleExpansion, forceRender)}

        {headerUi(parsedSong, handleExpansion)}

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

function headerUi(parsedSong: ParsedSong | null, handleExpansion: (e: React.MouseEvent) => void): JSX.Element {
    if (parsedSong === null) return <></>;

    return <div style={{ textAlign: 'center' }} onClick={handleExpansion}>
        {parsedSong.metadata.title} - {parsedSong.metadata.artist}
    </div>;
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

    return <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button style={{ fontSize: '1em', textAlign: 'left' }} onClick={onAll}>All</button>
        {trackCheckboxFor(tracks.guitar, 'Guitar')}
        {trackCheckboxFor(tracks.bass, 'Bass')}
        {trackCheckboxFor(tracks.vocals, 'Vocals')}
        {/* {trackCheckboxFor(tracks.drums, 'Drums')}
        {trackCheckboxFor(tracks.drums1, 'Drums 1')}
        {trackCheckboxFor(tracks.drums2, 'Drums 2')}
        {trackCheckboxFor(tracks.drums3, 'Drums 3')}
        {trackCheckboxFor(tracks.keys, 'Keys')}
        {trackCheckboxFor(tracks.backing, 'Backing')} */}
    </div>;
}

function trackCheckbox(
    track: HTMLAudioElement,
    label: string,
    onSolo: (track: HTMLAudioElement) => void,
    handleExpansion: (e: React.MouseEvent) => void
): JSX.Element {
    return <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '5px' }} onClick={handleExpansion}>
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

    Object.values(tracks).forEach(audio => {
        if (audio !== null) {
            apply(audio);
        }
    });
}

export default Player;
