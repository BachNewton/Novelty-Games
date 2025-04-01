import Loading from "../../../util/ui/Loading";
import { SongPackage } from "../logic/MusicDatabase";

interface LibraryProps {
    songPackages: SongPackage[] | null;
}

const Library: React.FC<LibraryProps> = ({ songPackages }) => {
    return <div style={{ padding: '5px' }}>
        {contentUi(songPackages)}
    </div>;
};

function contentUi(songPackages: SongPackage[] | null): JSX.Element | JSX.Element[] {
    if (songPackages === null) {
        return <Loading />;
    } else if (songPackages.length === 0) {
        return <div>You have no songs in your library</div>;
    } else {
        return songPackages.map((song, index) => <div key={index}>{song.folderName}</div>);
    }
}

export default Library;
