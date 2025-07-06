import { useRef, useState } from "react";
import Library from "./Library";
import Player from "./Player";
import MusicPlayerProgressBar, { ProgressState } from "./MusicPlayerProgressBar";
import { ParsedSongPackage } from "../logic/Parser";
import Scaffold from "../../../util/ui/Scaffold";
import { getMusicPlayerSongs, Song } from "../data/MusicPlayerIndex";
import { DownloadFileResponse, NetworkService } from "../../../util/networking/NetworkService";
import { SongParser } from "../logic/Parser2";

interface NewMusicPlayerProps {
    networkService: NetworkService<void>;
    progressState: ProgressState | null;
    songParser: SongParser;
}

const MusicPlayer: React.FC<NewMusicPlayerProps> = ({ networkService, progressState, songParser }) => {
    const songs = useRef(getMusicPlayerSongs());
    const [song, setSong] = useState<Song | null>(null);
    const [searchText, setSearchText] = useState<string>('');

    const onSongSelected = async (selectedSong: Song) => {
        console.log('Song selected:', selectedSong);
        songParser.parse(selectedSong);

        // if (guitar !== null) {
        //     const response = await networkService.downloadFile({ id: guitar });
        //     const blob = new Blob([response.buffer]);
        //     const url = URL.createObjectURL(blob);
        //     const audio = new Audio(url);
        //     audio.play();
        // }
    };

    return <Scaffold
        header={headerUi(text => setSearchText(text))}
        content={<Library songs={songs.current} onSongSelected={onSongSelected} />}
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

function footerUi(song: Song | null, progressState: ProgressState | null): JSX.Element {
    return <div style={{
        padding: '10px',
        borderTop: '3px solid var(--novelty-blue)',
        boxShadow: 'black 0px -10px 20px'
    }}>
        <MusicPlayerProgressBar state={progressState} />
        <Player songMetadata={song?.metadata ?? null} />
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
