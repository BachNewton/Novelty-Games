import Loading from "../../../util/ui/Loading";
import { SongPackage } from "../logic/MusicDatabase";
import { ParsedSongPackage } from "../logic/Parser";

interface LibraryProps {
    songs: ParsedSongPackage[] | null;
    onSongSelected: (song: SongPackage) => void;
}

const Library: React.FC<LibraryProps> = ({ songs, onSongSelected }) => {
    return <div>
        {contentUi(songs, onSongSelected)}
    </div>;
};

function contentUi(songs: ParsedSongPackage[] | null, onSongSelected: (song: SongPackage) => void): JSX.Element | JSX.Element[] {
    if (songs === null) {
        return <div style={{ marginTop: '25px' }}>
            <Loading />
        </div>;
    } else if (songs.length === 0) {
        return <div>Your music library is empty</div>;
    } else {
        return songsUi(songs, onSongSelected);
    }
}

function songsUi(songs: ParsedSongPackage[], onSongSelected: (song: SongPackage) => void): JSX.Element[] {
    const groupedSongs = groupSongsByArtist(songs);

    return Object.entries(groupedSongs)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([artist, songs]) => artistSectionUi(artist, songs, onSongSelected));
}

function groupSongsByArtist(songs: ParsedSongPackage[]): { [artist: string]: ParsedSongPackage[] } {
    return songs.reduce((acc, song) => {
        const artist = song.metadata.artist;

        if (!acc[artist]) {
            acc[artist] = [];
        }

        acc[artist].push(song);

        return acc;
    }, {} as { [artist: string]: ParsedSongPackage[] });
}

function artistSectionUi(artist: string, songs: ParsedSongPackage[], onSongSelected: (song: SongPackage) => void): JSX.Element {
    return <div key={artist} style={{}}>
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

function songUi(index: number, song: ParsedSongPackage, onSongSelected: (song: SongPackage) => void): JSX.Element {
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
