import { FestivalSong } from "../../../trivia/data/Data";
import Difficulty from "./Difficulty";
import DrumsIcon from "../icons/drums.png";
import GuitarIcon from "../icons/guitar.png";
import BassIcon from "../icons/bass.png";
import VocalsIcon from "../icons/vocals.png";
import VerticalSpacer from "../../../util/ui/Spacer";
import { SelectedInstruments } from "./Home";

const TRACK_WIDTH = '325px';
const ICON_SIZE = '40px';
const ALBUM_ART_SIZE = '100px';

interface TrackProps {
    song: FestivalSong;
    rank: number;
    selectedInstruments: SelectedInstruments;
    overallDifficulty: number;
}

const Track: React.FC<TrackProps> = ({ song, rank, selectedInstruments, overallDifficulty }) => {
    const guitarDifficulty = song.difficulties.guitar === null
        ? 'No part'
        : <Difficulty level={song.difficulties.guitar} isSelected={selectedInstruments.guitar} />;

    return <div style={{
        margin: '7.5px',
        padding: '7.5px',
        border: '1px solid var(--novelty-blue)',
        borderRadius: '15px',
        width: TRACK_WIDTH
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.3em' }}>#{rank}</div>

            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div>{song.name}</div>
                <div>{song.artist}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div>Owned</div>
                <input type='checkbox' style={{ accentColor: 'var(--novelty-orange)', transform: 'scale(1.75)' }} />
            </div>
        </div>

        <VerticalSpacer height='5px' />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <img style={{ height: ALBUM_ART_SIZE }} src={song.albumArt} />

            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={GuitarIcon} alt='Guitar' style={{ height: ICON_SIZE }} />
                    <div>{guitarDifficulty}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={BassIcon} alt='Bass' style={{ height: ICON_SIZE }} />
                    <div><Difficulty level={song.difficulties.bass} isSelected={selectedInstruments.bass} /></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={DrumsIcon} alt='Drums' style={{ height: ICON_SIZE }} />
                    <div><Difficulty level={song.difficulties.drums} isSelected={selectedInstruments.drums} /></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={VocalsIcon} alt='Vocals' style={{ height: ICON_SIZE }} />
                    <div><Difficulty level={song.difficulties.vocals} isSelected={selectedInstruments.vocals} /></div>
                </div>
            </div>

            <div style={{ fontWeight: 'bold', fontSize: '2em' }}>{overallDifficulty.toFixed(1)}</div>
        </div>
    </div>;
};

export default Track;
