import { FestivalSong } from "../../../trivia/data/Data";
import Difficulty from "./Difficulty";
import DrumsIcon from "../icons/drums.png";
import GuitarIcon from "../icons/guitar.png";
import BassIcon from "../icons/bass.png";
import VocalsIcon from "../icons/vocals.png";
import VerticalSpacer from "../../../util/ui/Spacer";

const ICON_SIZE = '40px';
const ALBUM_ART_SIZE = '80px';

interface TrackProps {
    song: FestivalSong;
    rank: number;
    overallDifficulty: number;
}

const Track: React.FC<TrackProps> = ({ song, rank, overallDifficulty }) => {
    return <div style={{
        padding: '7.5px',
        border: '1px solid var(--novelty-blue)'
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img style={{ height: ALBUM_ART_SIZE }} src={song.albumArt} />

            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={GuitarIcon} alt='Guitar' style={{ height: ICON_SIZE }} />
                    <div><Difficulty level={1} isSelected={true} /></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={BassIcon} alt='Bass' style={{ height: ICON_SIZE }} />
                    <div><Difficulty level={4} isSelected={true} /></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={DrumsIcon} alt='Drums' style={{ height: ICON_SIZE }} />
                    <div><Difficulty level={5} isSelected={true} /></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={VocalsIcon} alt='Vocals' style={{ height: ICON_SIZE }} />
                    <div><Difficulty level={6} isSelected={true} /></div>
                </div>
            </div>

            <div style={{ fontWeight: 'bold', fontSize: '2em' }}>{overallDifficulty}</div>
        </div>
    </div>;
};

export default Track;
