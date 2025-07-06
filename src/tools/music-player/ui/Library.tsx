import { getMusicPlayerSongs, Song } from "../data/MusicPlayerIndex";

interface LibraryProps {
    onSongSelected: () => void;
}

const Library: React.FC<LibraryProps> = ({ onSongSelected }) => {
    return <div>
        {songsUi(() => { })}
    </div>;
}

function songsUi(onSongSelected: () => void): JSX.Element[] {
    const songs = getMusicPlayerSongs();
    const groupedSongs = groupSongsByArtist(songs);

    return Object.entries(groupedSongs)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([artist, songs]) => artistSectionUi(artist, songs, onSongSelected));
}

function groupSongsByArtist(songs: Song[]): { [artist: string]: Song[] } {
    return songs.reduce((acc, song) => {
        const artist = song.metadata.artist;

        if (!acc[artist]) {
            acc[artist] = [];
        }

        acc[artist].push(song);

        return acc;
    }, {} as { [artist: string]: Song[] });
}

function artistSectionUi(artist: string, songs: Song[], onSongSelected: () => void): JSX.Element {
    return <div key={artist}>
        <div
            style={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--novelty-blue)',
                padding: '5px',
                fontWeight: 'bold'
            }}
        >
            {artist}
        </div>
        <div>
            {songs
                .sort((a, b) => a.metadata.title.localeCompare(b.metadata.title))
                .map((song, index) => songUi(index, song, onSongSelected))
            }
        </div>
    </div>;
}

function songUi(index: number, song: Song, onSongSelected: () => void): JSX.Element {
    return <div
        key={index}
        style={{
            fontSize: '0.8em',
            padding: '5px',
            margin: '5px',
            border: '2px solid var(--novelty-blue)',
            borderRadius: '10px',
            cursor: 'pointer'
        }}
        onClick={() => onSongSelected()}
    >{song.metadata.title}</div>;
}

export default Library;
