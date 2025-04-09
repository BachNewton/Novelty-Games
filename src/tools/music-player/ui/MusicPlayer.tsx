import { useState } from "react";
import { SongPackage } from "../logic/MusicDatabase";
import Library from "./Library";
import Player from "./Player";

interface NewMusicPlayerProps {
    importNewSongs: () => void;
    deleteAllSongs: () => void;
    songPackages: SongPackage[] | null;
}

const MusicPlayer: React.FC<NewMusicPlayerProps> = ({ importNewSongs, deleteAllSongs, songPackages }) => {
    const [song, setSong] = useState<SongPackage | null>(null);

    const promptDeleteAllSongs = () => {
        if (window.confirm('Are you sure you want to delete all songs?')) {
            deleteAllSongs();
        }
    };

    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontSize: '1.5em',
        color: 'white'
    }}>
        <div style={{ display: 'flex' }}>
            <button onClick={importNewSongs} style={{ fontSize: '1em', fontWeight: 'bold', flexGrow: 1 }}>Import New Songs 📁</button>
            <button onClick={promptDeleteAllSongs} style={{ fontSize: '1em' }}>🗑️</button>
        </div>

        <div style={{ flexGrow: 1, overflow: 'auto' }}>
            <Library songPackages={songPackages} onSongSelected={selectedSong => setSong(selectedSong)} />
        </div>

        <Player song={song} />
    </div>;
};

export default MusicPlayer;
