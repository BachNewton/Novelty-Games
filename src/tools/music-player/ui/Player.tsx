import { useState } from "react";

interface PlayerProps { }

enum PlayerState {
    PLAYING, PAUSED
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

const Player: React.FC<PlayerProps> = ({ }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [expanded, setExpanded] = useState(true);

    const icon = isPlaying ? '⏸️' : '▶️';

    const handleExpansion = (e: React.MouseEvent) => { if (e.target === e.currentTarget) setExpanded(!expanded) };

    return <div style={{
        padding: '10px',
        borderTop: '2px solid var(--novelty-blue)',
        boxShadow: 'black 0px -2px 25px'
    }}>
        {expandedUi(expanded, handleExpansion)}

        <div style={{ display: 'flex', justifyContent: 'center' }} onClick={handleExpansion}>
            <input
                type='range'
                min={0}
                max={100}
                // value={seconds}
                onChange={e => {
                    console.log('Slider changed', e.target.value);
                }}
                style={{ width: '75%', cursor: 'pointer' }}
            />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', fontSize: '1.75em' }} onClick={handleExpansion}>
            <div style={{ cursor: 'pointer' }} onClick={() => setIsPlaying(!isPlaying)}>
                {icon}
            </div>
        </div>
    </div>;
};

function expandedUi(expanded: boolean, handleExpansion: (e: React.MouseEvent) => void): JSX.Element {
    if (!expanded) return <></>;

    return <div>
        {trackCheckbox(0, new Audio(), 'Temp 1', () => { }, handleExpansion)}
        {trackCheckbox(1, new Audio(), 'Temp 2', () => { }, handleExpansion)}
        {trackCheckbox(2, new Audio(), 'Temp 3', () => { }, handleExpansion)}
        {trackCheckbox(3, new Audio(), 'Temp 4', () => { }, handleExpansion)}
        {trackCheckbox(4, new Audio(), 'Temp 5', () => { }, handleExpansion)}
        {trackCheckbox(5, new Audio(), 'Temp 6', () => { }, handleExpansion)}
    </div>;
}

function trackCheckbox(index: number, track: HTMLAudioElement, label: string, onSolo: () => void, handleExpansion: (e: React.MouseEvent) => void): JSX.Element {
    return <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '4px' }} onClick={handleExpansion}>
        <input
            type='checkbox'
            onChange={e => {
                track.muted = !e.target.checked;
            }}
            checked={!track.muted}
            style={{ transform: 'scale(2.5)' }}
        />
        <button style={{ width: '6em', fontSize: '1em' }} onClick={onSolo}>{label}</button>
    </div>
}

export default Player;
