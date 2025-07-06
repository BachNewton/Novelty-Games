import { useState } from "react";
import { SongPackage } from "../logic/MusicDatabase";
import Library from "./Library";
import Player from "./Player";
import MusicPlayerProgressBar, { ProgressState } from "./MusicPlayerProgressBar";
import { ParsedSongPackage } from "../logic/Parser";
import Scaffold from "../../../util/ui/Scaffold";

interface NewMusicPlayerProps {
    importNewSongs: () => void;
    deleteAllSongs: () => void;
    songs: ParsedSongPackage[] | null;
    progressState: ProgressState | null;
}

const MusicPlayer: React.FC<NewMusicPlayerProps> = ({ importNewSongs, deleteAllSongs, songs, progressState }) => {
    const [song, setSong] = useState<SongPackage | null>(null);
    const [searchText, setSearchText] = useState<string>('');

    const promptDeleteAllSongs = () => {
        if (window.confirm('Are you sure you want to delete all songs?')) {
            deleteAllSongs();
        }
    };

    return <Scaffold
        header={headerUi(text => setSearchText(text))}
        content={<div>
            <Library songs={filterBySearchText(songs, searchText)} onSongSelected={selectedSong => setSong(selectedSong)} />
        </div>}
        footer={footerUi(song, progressState)}
        fontScale={1.5}
    />;
};

function headerUi(setSearchText: (text: string) => void): JSX.Element {
    return <>
        <div style={{ display: 'flex' }}>
            <button onClick={() => { }} style={{ fontSize: '1em', fontWeight: 'bold', flexGrow: 1 }}>Import New Songs 📁</button>
            <button onClick={() => { }} style={{ fontSize: '1em' }}>🗑️</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '1.2em' }}>🔎</div>
            <input
                style={{ fontSize: '0.8em', flexGrow: 1, borderRadius: '15px', padding: '5px', margin: '5px' }}
                placeholder='Search'
                onChange={e => setSearchText(e.target.value)}
            />
        </div>
    </>;
}

function footerUi(song: SongPackage | null, progressState: ProgressState | null): JSX.Element {
    return <div style={{
        padding: '10px',
        borderTop: '3px solid var(--novelty-blue)',
        boxShadow: 'black 0px -10px 20px'
    }}>
        <MusicPlayerProgressBar state={progressState} />
        <Player song={song} />
    </div>;
}

function filterBySearchText(songs: ParsedSongPackage[] | null, searchText: string): ParsedSongPackage[] | null {
    if (searchText.length < 2 || songs === null) return songs;

    return songs.filter(song => {
        const search = searchText.toLowerCase();
        const artist = song.metadata.artist.toLowerCase();
        const title = song.metadata.title.toLowerCase();

        return artist.includes(search) || title.includes(search);
    });
}

export default MusicPlayer;
