import { useRef, useState } from "react";
import Library from "./Library";
import Player from "./Player";
import Scaffold from "../../../util/ui/Scaffold";
import { getMusicPlayerSongs, Song } from "../data/MusicPlayerIndex";
import { ParserProgress, SongParser } from "../logic/SongParser";
import ProgressBar from "../../../util/ui/ProgressBar";

interface NewMusicPlayerProps {
    songParser: SongParser;
}

const MusicPlayer: React.FC<NewMusicPlayerProps> = ({ songParser }) => {
    const songs = useRef(getMusicPlayerSongs());
    const [song, setSong] = useState<Song | null>(null);
    const [parserProgress, setParserProgress] = useState<ParserProgress | null>(null);
    const [searchText, setSearchText] = useState<string>('');

    const onSongSelected = async (selectedSong: Song) => {
        console.log('Song selected:', selectedSong);
        const parsedSong = songParser.parse(selectedSong, progress => setParserProgress(progress));
        console.log(parsedSong);
    };

    const filteredSongs = filterBySearchText(songs.current, searchText);

    return <Scaffold
        header={headerUi(text => setSearchText(text))}
        content={<Library songs={filteredSongs} onSongSelected={onSongSelected} />}
        footer={footerUi(song, parserProgress)}
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

function footerUi(song: Song | null, progress: ParserProgress | null): JSX.Element {
    const progressUi = progress === null
        ? <></>
        : <ProgressBar progress={progress.current / progress.total} />;

    return <div style={{
        padding: '10px',
        borderTop: '3px solid var(--novelty-blue)',
        boxShadow: 'black 0px -10px 20px'
    }}>
        {progressUi}
        <Player songMetadata={song?.metadata ?? null} />
    </div>;
}

function filterBySearchText(songs: Song[], searchText: string): Song[] {
    if (searchText.length < 2) return songs;

    return songs.filter(song => {
        const search = searchText.toLowerCase();
        const artist = song.metadata.artist.toLowerCase();
        const title = song.metadata.title.toLowerCase();

        return artist.includes(search) || title.includes(search);
    });
}

export default MusicPlayer;
