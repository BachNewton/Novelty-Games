import { Song } from "../data/Song";

interface LibraryProps {
    songs: Song[];
    onSongSelected: (song: Song) => void;
}

const Library: React.FC<LibraryProps> = ({ songs, onSongSelected }) => {
    return <div>
        {songsUi(songs, onSongSelected)}
    </div>;
}

function songsUi(songs: Song[], onSongSelected: (song: Song) => void): JSX.Element[] {
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

function artistSectionUi(artist: string, songs: Song[], onSongSelected: (song: Song) => void): JSX.Element {
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

function songUi(index: number, song: Song, onSongSelected: (song: Song) => void): JSX.Element {
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
        onClick={() => onSongSelected(song)}
    >{song.metadata.title}</div>;
}

export default Library;
