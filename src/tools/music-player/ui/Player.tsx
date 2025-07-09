import { useEffect, useState } from "react";
import { ParsedSong } from "../logic/SongParser";
import { Conductor, State } from "../logic/Conductor";
import { TrackIds } from "../data/MusicPlayerIndex";

const SLIDER_UPDATE_INTERVAL = 200;

interface PlayerProps {
    parsedSong: ParsedSong | null;
}

const Player: React.FC<PlayerProps> = ({ parsedSong }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [conductor, setConductor] = useState<Conductor | null>(null);
    const [_, setForceRender] = useState(false);

    useEffect(() => {
        const updateSliderInterval = setInterval(() => {
            setSeconds(conductor?.currentTime ?? 0);
        }, SLIDER_UPDATE_INTERVAL);

        return () => clearInterval(updateSliderInterval);
    }, [conductor]);

    useEffect(() => {
        conductor?.stop();
        setConductor(null);

        parsedSong?.conductorPromise.then(conductor => {
            conductor.togglePlay();
            setIsExpanded(true);
            setConductor(conductor);
        });
    }, [parsedSong]);

    const handleExpansion = (e: React.MouseEvent) => { if (e.target === e.currentTarget) setIsExpanded(!isExpanded) };

    const onPlayButtonClick = () => conductor?.togglePlay();

    const forceRender = () => setForceRender(prev => !prev);

    const onSolo = (id: keyof TrackIds) => {
        conductor?.solo(id);
        forceRender();
    };

    const onAll = () => {
        conductor?.all();
        forceRender();
    };

    const onToggleMute = (id: keyof TrackIds) => {
        conductor?.toggleMute(id);
        forceRender();
    };

    return <div>
        {expandedUi(isExpanded, conductor, handleExpansion, onSolo, onAll, onToggleMute)}

        {headerUi(parsedSong, handleExpansion)}

        <div style={{ display: 'flex', justifyContent: 'center' }} onClick={handleExpansion}>
            {sliderUi(conductor, seconds, time => conductor?.updateTime(time))}
        </div>

        {iconBarUi(conductor, onPlayButtonClick, handleExpansion)}
    </div>;
};

function iconBarUi(
    conductor: Conductor | null,
    onPlayButtonClick: () => void,
    handleExpansion: (e: React.MouseEvent) => void
): JSX.Element {
    const icon = conductor === null ? '⏯️' : conductor.state === State.Playing ? '⏸️' : '▶️';

    return <div style={{ display: 'flex', justifyContent: 'center', fontSize: '1.75em', alignItems: 'center' }} onClick={handleExpansion}>
        <div style={{ flex: 1 }} />
        <div style={{ cursor: 'pointer' }} onClick={onPlayButtonClick}>
            {icon}
        </div>
        <div style={{ flex: 1, display: 'flex' }}>
            <div style={{ flex: 1 }} onClick={handleExpansion} />
            <div style={{ cursor: 'pointer' }}>💾</div>
        </div>
    </div>;
}

function headerUi(parsedSong: ParsedSong | null, handleExpansion: (e: React.MouseEvent) => void): JSX.Element {
    if (parsedSong === null) return <></>;

    return <div style={{ textAlign: 'center', marginTop: '5px', userSelect: 'none' }} onClick={handleExpansion}>
        {parsedSong.metadata.title} - {parsedSong.metadata.artist}
    </div>;
}

function sliderUi(conductor: Conductor | null, seconds: number, updateTime: (time: number) => void): JSX.Element {
    return <input
        type='range'
        min={0}
        max={conductor?.duration ?? 0}
        value={seconds}
        onChange={e => {
            const time = Number(e.target.value);
            updateTime(time);
        }}
        style={{ width: '75%', cursor: 'pointer' }}
    />;
}

function expandedUi(
    expanded: boolean,
    conductor: Conductor | null,
    handleExpansion: (e: React.MouseEvent) => void,
    onSolo: (id: keyof TrackIds) => void,
    onAll: () => void,
    onToggleMute: (id: keyof TrackIds) => void
): JSX.Element {
    if (!expanded) return <></>;

    const trackCheckboxFor = (id: keyof TrackIds, label: string) => {
        return trackCheckbox(
            label,
            conductor?.isMuted(id) ?? true,
            () => onSolo(id),
            () => onToggleMute(id),
            handleExpansion
        );
    };

    return <div style={{ display: 'flex', flexDirection: 'column', marginTop: '5px' }}>
        <button style={{ fontSize: '1em', textAlign: 'left' }} onClick={onAll}>All</button>
        {trackCheckboxFor('guitar', 'Guitar')}
        {trackCheckboxFor('bass', 'Bass')}
        {trackCheckboxFor('vocals', 'Vocals')}
        {trackCheckboxFor('drums', 'Drums')}
        {trackCheckboxFor('drums1', 'Drums 1')}
        {trackCheckboxFor('drums2', 'Drums 2')}
        {trackCheckboxFor('drums3', 'Drums 3')}
        {trackCheckboxFor('keys', 'Keys')}
        {trackCheckboxFor('backing', 'Backing')}
    </div>;
}

function trackCheckbox(
    label: string,
    isMuted: boolean,
    onSolo: () => void,
    onToggleMute: () => void,
    handleExpansion: (e: React.MouseEvent) => void
): JSX.Element {
    return <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '5px' }} onClick={handleExpansion}>
        <input
            type='checkbox'
            onChange={onToggleMute}
            checked={!isMuted}
            style={{ transform: 'scale(2.5)' }}
        />
        <button style={{ width: '6em', fontSize: '1em' }} onClick={onSolo}>{label}</button>
    </div>;
}

export default Player;
