import Library from "./Library";
import Player from "./Player";

interface NewMusicPlayerProps {
    importNewSongs: () => void;
}

const NewMusicPlayer: React.FC<NewMusicPlayerProps> = ({ importNewSongs }) => {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontSize: '1.5em',
        color: 'white'
    }}>
        <button onClick={importNewSongs} style={{ fontSize: '1em', width: '100%' }}>Import New Songs 📁</button>

        <div style={{ flexGrow: 1, overflow: 'auto' }}>
            <Library />
        </div>

        <Player />
    </div>;
};

export default NewMusicPlayer;
