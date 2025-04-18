import Loading from "../../../util/ui/Loading";
import { SongPackage } from "../logic/MusicDatabase";
import { ParsedSongPackage } from "../logic/Parser";

interface LibraryProps {
    songs: ParsedSongPackage[] | null;
    onSongSelected: (song: SongPackage) => void;
}

const Library: React.FC<LibraryProps> = ({ songs, onSongSelected }) => {
    return <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {contentUi(songs, onSongSelected)}
    </div>;
};

function contentUi(songs: ParsedSongPackage[] | null, onSongSelected: (song: SongPackage) => void): JSX.Element | JSX.Element[] {
    if (songs === null) {
        return <Loading />;
    } else if (songs.length === 0) {
        return <div>Your music library is empty</div>;
    } else {
        return songs.sort((a, b) => a.metadata.artist.localeCompare(b.metadata.artist)).map((song, index) => <div
            key={index}
            style={{
                fontSize: '0.8em',
                padding: '5px',
                border: '2px solid var(--novelty-blue)',
                borderRadius: '10px',
                cursor: 'pointer'
            }}
            onClick={() => onSongSelected(song)}
        >{song.metadata.artist} - {song.metadata.title}</div>);
    }
}

export default Library;
