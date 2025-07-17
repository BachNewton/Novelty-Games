import { useRef, useState } from "react";
import Library from "./Library";
import Player from "./Player";
import Scaffold from "../../../util/ui/Scaffold";
import { Song } from "../data/Song";
import { ParsedSong, ParserProgress, SongParser } from "../logic/SongParser";
import ProgressBar from "../../../util/ui/ProgressBar";
import Button from "../../../util/ui/Button";
import Icon, { Type } from "./Icon";
import Dialog from "../../../util/ui/Dialog";
import Checkbox from "../../../util/ui/Checkbox";
import { MusicIndex } from "../logic/MusicIndex";

const FONT_SCALE = 1.4;

interface NewMusicPlayerProps {
    songParser: SongParser;
    musicIndex: MusicIndex;
}

const MusicPlayer: React.FC<NewMusicPlayerProps> = ({ songParser, musicIndex }) => {
    const songs = useRef(musicIndex.songs);
    const genres = useRef([...musicIndex.genres]);
    const [parsedSong, setParsedSong] = useState<ParsedSong | null>(null);
    const [parserProgress, setParserProgress] = useState<ParserProgress | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [genresSelected, setGenresSelected] = useState(new Map<string, boolean>());
    const [isFilterUiOpen, setIsFilterUiOpen] = useState(false);

    const onSongSelected = async (selectedSong: Song) => {
        console.log('Song selected:', selectedSong);
        const parsedSong = songParser.parse(selectedSong, progress => setParserProgress(progress));
        setParsedSong(parsedSong);
    };

    const onGenreSelected = (genre: string) => {
        const selected = genresSelected.get(genre) ?? true;
        genresSelected.set(genre, !selected);
        setGenresSelected(new Map(genresSelected));
    };

    const onOnlyGenreSelected = (onlyGenre: string) => {
        for (const genre of genres.current) {
            genresSelected.set(genre, genre === onlyGenre);
        }

        setGenresSelected(new Map(genresSelected));
    };

    const onAllGenresSelected = () => {
        setGenresSelected(new Map());
        setIsFilterUiOpen(false);
    };

    const filteredSongs = filterBySearchText(songs.current, searchText);

    return <>
        <Dialog isOpen={isFilterUiOpen}>
            {filtersUi(
                genres.current,
                genresSelected,
                onGenreSelected,
                onOnlyGenreSelected,
                onAllGenresSelected,
                () => setIsFilterUiOpen(false)
            )}
        </Dialog>

        <Scaffold
            header={headerUi(text => setSearchText(text), () => setIsFilterUiOpen(true))}
            footer={footerUi(parsedSong, parserProgress)}
            fontScale={FONT_SCALE}
        >
            <Library songs={filteredSongs} onSongSelected={onSongSelected} />
        </Scaffold>
    </>;
};

function filtersUi(
    genres: string[],
    genresSelected: Map<string, boolean>,
    onGenreClicked: (genre: string) => void,
    onOnlyGenreClicked: (onlyGenre: string) => void,
    onAll: () => void,
    onDone: () => void
): JSX.Element {
    const checkboxes = genres.map((genre, index) =>
        <Checkbox
            key={index}
            text={genre}
            checked={genresSelected.get(genre) ?? true}
            onClick={() => onGenreClicked(genre)}
            onOnlyClick={() => onOnlyGenreClicked(genre)}
        />
    );

    return <>
        <div style={{ fontSize: '2em', fontWeight: 'bold', textAlign: 'center' }}>Genre Filter</div>
        <Button onClick={onAll}><div style={{ width: '66vw', fontSize: '1.3em' }}>All</div></Button>
        <div style={{ overflow: 'auto', height: '66vh', margin: '15px 0px' }}>{checkboxes}</div>

        <Button onClick={onDone}><div style={{ width: '66vw', fontSize: '1.5em' }}>Done</div></Button>
    </>;
}

function headerUi(setSearchText: (text: string) => void, onFilterClicked: () => void): JSX.Element {
    return <div style={{ display: 'flex', alignItems: 'center' }}>
        <Icon type={Type.SEARCH} size={2} />

        <input
            style={{ fontSize: '0.8em', flexGrow: 1, borderRadius: '15px', padding: '5px', margin: '5px' }}
            placeholder='Search'
            onChange={e => setSearchText(e.target.value)}
        />

        <Button onClick={onFilterClicked} borderRadius={15}><Icon type={Type.FILTER} size={1.5} /></Button>
    </div>;
}

function footerUi(parsedSong: ParsedSong | null, progress: ParserProgress | null): JSX.Element {
    const progressUi = progress === null
        ? <></>
        : <ProgressBar progress={progress.current / progress.total} />;

    return <div style={{
        padding: '10px',
        borderTop: '3px solid var(--novelty-blue)',
        boxShadow: 'black 0px -10px 20px'
    }}>
        {progressUi}
        <Player parsedSong={parsedSong} />
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
