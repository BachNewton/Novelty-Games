import { SongPackage } from "../logic/MusicDatabase";
import Library from "./Library";
import Player from "./Player";

interface NewMusicPlayerProps {
    importNewSongs: () => void;
    songPackages: SongPackage[] | null;
}

const NewMusicPlayer: React.FC<NewMusicPlayerProps> = ({ importNewSongs, songPackages }) => {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontSize: '1.5em',
        color: 'white'
    }}>
        <button onClick={importNewSongs} style={{ fontSize: '1em', width: '100%' }}>Import New Songs 📁</button>

        <div style={{ flexGrow: 1, overflow: 'auto' }}>
            <Library songPackages={songPackages} />
        </div>

        <Player />
    </div>;
};

export default NewMusicPlayer;
