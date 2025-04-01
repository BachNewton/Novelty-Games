import { useState } from "react";
import { SongPackage } from "../logic/MusicDatabase";
import Library from "./Library";
import Player from "./Player";

interface NewMusicPlayerProps {
    importNewSongs: () => void;
    songPackages: SongPackage[] | null;
}

const MusicPlayer: React.FC<NewMusicPlayerProps> = ({ importNewSongs, songPackages }) => {
    const [song, setSong] = useState<SongPackage | null>(null);

    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontSize: '1.5em',
        color: 'white'
    }}>
        <button onClick={importNewSongs} style={{ fontSize: '1em', width: '100%', fontWeight: 'bold' }}>Import New Songs 📁</button>

        <div style={{ flexGrow: 1, overflow: 'auto' }}>
            <Library songPackages={songPackages} onSongSelected={selectedSong => setSong(selectedSong)} />
        </div>

        <Player song={song} />
    </div>;
};

export default MusicPlayer;
