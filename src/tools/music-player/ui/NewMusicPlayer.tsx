import Library from "./Library";
import Player from "./Player";

interface NewMusicPlayerProps { }

const NewMusicPlayer: React.FC<NewMusicPlayerProps> = ({ }) => {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontSize: '1.5em',
        color: 'white'
    }}>
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
            <Library />
        </div>
        <Player />
    </div>;
};

export default NewMusicPlayer;
