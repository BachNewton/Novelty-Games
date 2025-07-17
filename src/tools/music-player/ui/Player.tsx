import { useEffect, useState } from "react";
import { ParsedSong } from "../logic/SongParser";
import { Conductor, State as ConductorState } from "../logic/Conductor";
import { TrackIds } from "../data/Song";
import Icon, { Type } from "./Icon";

const SLIDER_UPDATE_INTERVAL = 200;
const BUTTON_SYLE: React.CSSProperties = { fontSize: '1.15em', borderRadius: '15px', padding: '5px', textAlign: 'left' }

interface PlayerProps {
    parsedSong: ParsedSong | null;
}

const Player: React.FC<PlayerProps> = ({ parsedSong }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [conductor, setConductor] = useState<Conductor | null>(null);
    const [, setForceRender] = useState(false);

    useEffect(() => {
        const updateSliderInterval = setInterval(() => {
            setSeconds(conductor?.currentTime ?? 0);
        }, SLIDER_UPDATE_INTERVAL);

        return () => clearInterval(updateSliderInterval);
    }, [conductor]);

    useEffect(() => {
        conductor?.stop();
        setConductor(null);
        setIsExpanded(false);

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
            {sliderUi(conductor?.duration ?? 0, seconds, time => {
                conductor?.updateTime(time);
                setSeconds(time);
            })}
        </div>

        {iconBarUi(conductor, onPlayButtonClick, handleExpansion)}
    </div>;
};

function iconBarUi(
    conductor: Conductor | null,
    onPlayButtonClick: () => void,
    handleExpansion: (e: React.MouseEvent) => void
): JSX.Element {
    const iconState = conductor === null ? Type.LOADING : conductor.state === ConductorState.Playing ? Type.PAUSE : Type.PLAY;
    const icon = <Icon type={iconState} size={3.5} />;

    return <div style={{ display: 'flex', justifyContent: 'center' }} onClick={handleExpansion}>
        <div style={{ cursor: 'pointer', border: '4px solid var(--novelty-blue)', borderRadius: '100%', margin: '12px' }} onClick={onPlayButtonClick}>
            {icon}
        </div>
    </div>;
}

function headerUi(parsedSong: ParsedSong | null, handleExpansion: (e: React.MouseEvent) => void): JSX.Element {
    if (parsedSong === null) return <></>;

    return <div style={{ textAlign: 'center', margin: '10px 0px', userSelect: 'none', fontWeight: 'bold' }} onClick={handleExpansion}>
        {parsedSong.metadata.title} - {parsedSong.metadata.artist}
    </div>;
}

function sliderUi(duration: number, time: number, updateTime: (time: number) => void): JSX.Element {
    return <input
        type='range'
        min={0}
        max={duration}
        value={time}
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
    if (!expanded || conductor === null) return <></>;

    const trackCheckboxFor = (id: keyof TrackIds, label: string) => {
        if (conductor.isAvailable(id)) {
            return trackCheckbox(
                label,
                conductor.isMuted(id),
                () => onSolo(id),
                () => onToggleMute(id),
                handleExpansion
            );
        } else {
            return <></>;
        }
    };

    return <div style={{ display: 'flex', flexDirection: 'column', marginTop: '5px' }}>
        <button style={BUTTON_SYLE} onClick={onAll}>All</button>
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
    return <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '7.5px' }} onClick={handleExpansion}>
        <input
            type='checkbox'
            onChange={onToggleMute}
            checked={!isMuted}
            style={{ transform: 'scale(2.5)' }}
        />
        <button style={{ width: '6em', ...BUTTON_SYLE }} onClick={onSolo}>{label}</button>
    </div>;
}

export default Player;
