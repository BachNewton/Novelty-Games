import { useEffect, useRef, useState } from "react";
import { get } from "../../../trivia/logic/Repository";
import { DataType, FestivalSong } from "../../../trivia/data/Data";
import Loading from "../../../util/ui/Loading";
import { Route, updateRoute } from "../../../ui/Routing";
import React from "react";
import ToggleSwitch from "../../../util/ui/ToggleSwitch";
import { deleteData } from "../../../trivia/logic/Database";
import VerticalSpacer from "../../../util/ui/Spacer";
import HorizontalLine from "../../../util/ui/HorizontalLine";
import Button from "../../../util/ui/Button";
import Widget from "./Widget";
import Track from "./Track";
import { createFortniteFestivalDatabase, getSuperKey } from "../logic/FortniteFestivalDatabase";
import SortIcon from "../icons/sort.svg";
import { calculateOverallDifficulty } from "../logic/OverallDifficulty";
import { RankedSong } from "../data/RankedSong";

const INITIAL_VISIBLE_COUNT = 25; // Initial number of songs to show
const SONGS_PER_PAGE = 25; // Number of songs to load on scroll
const DISTANCE_FROM_BOTTOM_PX = 400; // Distance from the bottom of the page to trigger loading more songs
const DIFFICULTY_WEIGHT_DEFAULT = 1.3;
const DESCRIPTION_FONT_SIZE = '0.75em';

interface HomeProps {
    loadingSongs: Promise<Array<FestivalSong>>;
}

export interface SelectedInstruments {
    guitar: boolean;
    drums: boolean;
    bass: boolean;
    vocals: boolean;
}

type Instrument = keyof SelectedInstruments;

enum SortOrder {
    ASCENDING, DESCENDING
}

const Home: React.FC<HomeProps> = ({ loadingSongs }) => {
    const database = useRef(createFortniteFestivalDatabase()).current;
    const [songs, setSongs] = useState<Array<FestivalSong> | null>(null);
    const [filterEpicGamesSongs, setFilterEpicGamesSongs] = useState(false);
    const [filterOwnedSongs, setFilterOwnedSongs] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [difficultyWeight, setDifficultyWeight] = useState(DIFFICULTY_WEIGHT_DEFAULT);
    const [ownedSongs, setOwnedSongs] = useState(new Set<string>());
    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESCENDING);

    const [selectedInstruments, setSelectedInstruments] = useState<SelectedInstruments>({
        guitar: true,
        drums: true,
        bass: true,
        vocals: true
    });

    const [selectedProInstruments, setSelectedProInstruments] = useState<SelectedInstruments>({
        guitar: false,
        drums: false,
        bass: false,
        vocals: false
    });

    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    useEffect(() => {
        updateRoute(Route.FORTNITE_FESTIVAL);

        loadingSongs.then(songs => setSongs(songs));

        database.getOwnedSongs().then(savedOwnedSongs => setOwnedSongs(savedOwnedSongs));
    }, []);

    // Infinite scroll effect
    useEffect(() => {
        const onScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - DISTANCE_FROM_BOTTOM_PX) {
                setVisibleCount(count => Math.min((songs?.length ?? 0), count + SONGS_PER_PAGE));
            }
        };

        window.addEventListener('scroll', onScroll);

        return () => window.removeEventListener('scroll', onScroll);
    }, [songs]);

    // Reset visibleCount when searchText changes
    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    }, [searchText, filterEpicGamesSongs, filterOwnedSongs]);

    const onInstrumentToggled = (instrument: Instrument, isPro: boolean) => {
        const setter = isPro ? setSelectedProInstruments : setSelectedInstruments;

        if (instrument === 'guitar') {
            setter(prev => ({ ...prev, guitar: !prev.guitar }));
        } else if (instrument === 'drums') {
            setter(prev => ({ ...prev, drums: !prev.drums }));
        } else if (instrument === 'bass') {
            setter(prev => ({ ...prev, bass: !prev.bass }));
        } else if (instrument === 'vocals') {
            setter(prev => ({ ...prev, vocals: !prev.vocals }));
        }
    };

    const updateOwnedSong = (isOwned: boolean, song: FestivalSong) => {
        const superKey = getSuperKey(song);

        if (isOwned) {
            ownedSongs.add(superKey)
        } else {
            ownedSongs.delete(superKey);
        }

        setOwnedSongs(new Set(ownedSongs));
        database.updateOwnedSong(isOwned, song);
    };

    const changeSortOrder = () => {
        setSortOrder(prev => prev === SortOrder.DESCENDING ? SortOrder.ASCENDING : SortOrder.DESCENDING);
    };

    const filteredSongs = songs?.filter(song => {
        if (filterEpicGamesSongs && song.artist.includes('Epic Games')) return false;
        if (filterOwnedSongs && !ownedSongs.has(getSuperKey(song))) return false;

        return true;
    }) ?? null;

    return <div>
        <div style={{ margin: '15px', fontSize: '1.2em' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.75em', textAlign: 'center', color: 'var(--novelty-orange)' }}>
                Fortnite Festival Difficulty Rankings
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Widget>
                    {toolsUi(
                        filterEpicGamesSongs,
                        setFilterEpicGamesSongs,
                        filterOwnedSongs,
                        setFilterOwnedSongs,
                        fetchedSongs => setSongs(fetchedSongs),
                        () => database.importOwnedSongs().then(importedSongs => setOwnedSongs(importedSongs)),
                        database.exportOwnedSongs
                    )}
                </Widget>

                <Widget>
                    {instrumentSelectorUi(selectedInstruments, instrument => onInstrumentToggled(instrument, false), false)}
                </Widget>

                <Widget>
                    {instrumentSelectorUi(selectedProInstruments, instrument => onInstrumentToggled(instrument, true), true)}
                </Widget>
            </div>

            <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                <Widget>
                    {difficultyWeightUi(difficultyWeight, setDifficultyWeight)}
                </Widget>

                {searchUi(searchText, setSearchText, sortOrder, changeSortOrder)}
            </div>
        </div>

        <HorizontalLine thickness='4px' color='var(--novelty-blue)' />
        <VerticalSpacer height={15} />

        {songsUi(
            filteredSongs,
            searchText,
            difficultyWeight,
            selectedInstruments,
            selectedProInstruments,
            visibleCount,
            sortOrder,
            ownedSongs,
            updateOwnedSong
        )}
    </div >;
};

function searchUi(
    searchText: string,
    setSearchText: (text: string) => void,
    sortOrder: SortOrder,
    changeSortOrder: () => void
): JSX.Element {
    const sortIconTransformation = sortOrder === SortOrder.ASCENDING ? 'rotate(180deg) scaleX(-1)' : 'none';

    return <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0px' }}>
        <input
            style={{ fontSize: '1em', borderRadius: '15px', padding: '7.5px', flexGrow: 1 }}
            placeholder='Search'
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
        />

        <img src={SortIcon} alt='Sort' style={{
            height: '50px',
            border: '1px solid var(--novelty-blue)',
            borderRadius: '15px',
            cursor: 'pointer',
            padding: '1px',
            marginLeft: '5px',
            boxShadow: 'black 0px 0px 10px',
            transform: sortIconTransformation
        }} onClick={changeSortOrder} />
    </div>;
}

function toolsUi(
    filterEpicGamesSongs: boolean,
    setFilterEpicGamesSongs: (checked: boolean) => void,
    filterOwnedSongs: boolean,
    setFilterOwnedSongs: (checked: boolean) => void,
    onSongsFetched: (fetchedSongs: FestivalSong[] | null) => void,
    onImport: () => void,
    onExport: () => void
): JSX.Element {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        gap: '10px',
        height: '100%'
    }}>
        <div><Button borderRadius={15} onClick={() => fetchLatestSongs(onSongsFetched)}>
            <div style={{ padding: '5px' }}>Fetch Latest Songs</div>
        </Button></div>

        <div><Button borderRadius={15} onClick={onImport}>
            <div style={{ padding: '5px' }}>Import Owned Songs</div>
        </Button></div>

        <div><Button borderRadius={15} onClick={onExport}>
            <div style={{ padding: '5px' }}>Export Owned Songs</div>
        </Button></div>

        <div style={{ display: 'flex', gap: '10px' }}>
            <div>Filter Epic Games Songs</div>
            <ToggleSwitch enabled={filterEpicGamesSongs} onChange={checked => setFilterEpicGamesSongs(checked)} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
            <div>Filter Owned Songs</div>
            <ToggleSwitch enabled={filterOwnedSongs} onChange={checked => setFilterOwnedSongs(checked)} />
        </div>
    </div>;
}

function instrumentSelectorUi(selectedInstruments: SelectedInstruments, instrumentToggled: (instrument: Instrument) => void, isPro: boolean): JSX.Element {
    const headerLabel = isPro ? 'Pro Instruments' : 'Select Instruments';

    const description = isPro
        ? 'Select if you want the pro difficulty of an instrument included in the difficulty calculations.'
        : 'Select which instruments you want to include in the difficulty calculations.';

    const guitarLabel = isPro ? 'Pro Guitar' : 'Guitar';
    const bassLabel = isPro ? 'Pro Bass' : 'Bass';
    const drumsLabel = isPro ? 'Pro Drums' : 'Drums';
    const vocalsLabel = isPro ? <span style={{ textDecoration: 'line-through', color: 'grey' }}>Pro Vocals</span> : 'Vocals';

    return <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        justifyItems: 'center',
        gap: '10px',
        maxWidth: '250px'
    }}>
        <div style={{ gridColumn: 'span 2', fontWeight: 'bold', fontSize: '1.2em' }}>{headerLabel}</div>

        <div style={{ gridColumn: 'span 2', fontSize: DESCRIPTION_FONT_SIZE }}>
            {description}
        </div>

        <div>{guitarLabel}</div>
        <ToggleSwitch enabled={selectedInstruments.guitar} onChange={() => instrumentToggled('guitar')} />
        <div>{bassLabel}</div>
        <ToggleSwitch enabled={selectedInstruments.bass} onChange={() => instrumentToggled('bass')} />
        <div>{drumsLabel}</div>
        <ToggleSwitch enabled={selectedInstruments.drums} onChange={() => instrumentToggled('drums')} />
        <div>{vocalsLabel}</div>
        <ToggleSwitch enabled={selectedInstruments.vocals} onChange={() => { if (!isPro) instrumentToggled('vocals') }} />
    </div>;
}

function difficultyWeightUi(difficultyWeight: number, setDifficultyWeight: (weight: number) => void): JSX.Element {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px'
    }}>
        <div style={{ gridColumn: 'span 2', fontWeight: 'bold', fontSize: '1.2em' }}>Difficulty Weight</div>

        <div style={{ gridColumn: 'span 2', fontSize: DESCRIPTION_FONT_SIZE }}>
            Provides control over how much high-difficulty parts affect the overall difficulty. A higher weight means the hardest parts will have more influence on the overall score. If the weight is 1, it's just a simple average.
        </div>

        <div style={{ display: 'flex', width: '100%', gap: '5px' }}>
            <input
                type='range'
                min={1}
                max={3}
                step={0.1}
                value={difficultyWeight}
                onChange={e => setDifficultyWeight(Number(e.target.value))}
                style={{ flexGrow: 1, accentColor: 'var(--novelty-orange)', cursor: 'pointer' }}
            />
            <div>{difficultyWeight.toFixed(1)}</div>
        </div>
    </div>;
}

function songsUi(
    songs: Array<FestivalSong> | null,
    searchText: string,
    difficultyWeight: number,
    selectedInstruments: SelectedInstruments,
    selectedProInstruments: SelectedInstruments,
    visibleCount: number,
    sortOrder: SortOrder,
    ownedSongs: Set<string>,
    updateOwnedSong: (isOwned: boolean, song: FestivalSong) => void
): JSX.Element {
    if (songs === null) return <Loading />;

    const getOverallDifficulty = (song: FestivalSong) => calculateOverallDifficulty(
        song,
        difficultyWeight,
        selectedInstruments,
        selectedProInstruments
    );

    const sortedSongs = songs.sort((a, b) => {
        const aDifficulty = getOverallDifficulty(a);
        const bDifficulty = getOverallDifficulty(b);

        const compare = sortOrder === SortOrder.DESCENDING
            ? aDifficulty - bDifficulty
            : bDifficulty - aDifficulty;

        if (compare === 0) {
            const aSeconds = lengthToSeconds(a.length);
            const bSeconds = lengthToSeconds(b.length);

            const subCompare = sortOrder === SortOrder.DESCENDING
                ? aSeconds - bSeconds
                : bSeconds - aSeconds;

            return subCompare;
        } else {
            return compare;
        }
    });

    const rankedSongs = sortedSongs.map<RankedSong>((song, index) => {
        const rank = sortOrder === SortOrder.DESCENDING
            ? sortedSongs.length - index
            : index + 1;

        return {
            rank: rank,
            overallDifficulty: getOverallDifficulty(song),
            ...song
        };
    });

    const searchedSongs = rankedSongs.filter(song => filterBySearchText(song, searchText));

    const visibleSongs = searchedSongs.slice(0, visibleCount); // Only show visibleCount songs

    const tracks = visibleSongs.map((song, index) => {
        return <Track
            key={index}
            song={song}
            rank={song.rank}
            selectedInstruments={selectedInstruments}
            selectedProInstruments={selectedProInstruments}
            overallDifficulty={song.overallDifficulty}
            isOwned={ownedSongs.has(getSuperKey(song))}
            updateOwned={isOwned => updateOwnedSong(isOwned, song)}
        />;
    });

    return <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {tracks}
    </div>;
}

function filterBySearchText(song: FestivalSong, searchText: string): boolean {
    if (searchText.length < 2) return true;

    const search = searchText.toLowerCase();
    const artist = song.artist.toLowerCase();
    const title = song.name.toLowerCase();

    return artist.includes(search) || title.includes(search);
}

export async function getFestivalSongs(): Promise<Array<FestivalSong>> {
    const data = await get(DataType.FORTNITE_FESTIVAL, { emit: () => { } });

    return data as Array<FestivalSong>;
}

async function fetchLatestSongs(onSongsFetched: (fetchedSongs: FestivalSong[] | null) => void) {
    onSongsFetched(null);

    await deleteData(DataType.FORTNITE_FESTIVAL);

    const songs = await getFestivalSongs();

    onSongsFetched(songs);
}

function lengthToSeconds(time: string): number {
    const [min, sec] = time.split(':').map(Number);

    return min * 60 + sec;
}

export default Home;
