import Loading from "../../../util/ui/Loading";
import { SongPackage } from "../logic/MusicDatabase";

interface LibraryProps {
    songPackages: SongPackage[] | null;
    onSongSelected: (song: SongPackage) => void;
}

const Library: React.FC<LibraryProps> = ({ songPackages, onSongSelected }) => {
    return <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {contentUi(songPackages, onSongSelected)}
    </div>;
};

function contentUi(songPackages: SongPackage[] | null, onSongSelected: (song: SongPackage) => void): JSX.Element | JSX.Element[] {
    if (songPackages === null) {
        return <Loading />;
    } else if (songPackages.length === 0) {
        return <div>Your music library is empty</div>;
    } else {
        return songPackages.map((song, index) => <button
            key={index}
            style={{ fontSize: '0.8em', padding: '4px', textAlign: 'left' }}
            onClick={() => onSongSelected(song)}
        >{song.folderName}</button>);
    }
}

export default Library;
