import { useEffect, useState } from "react";
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

const VISIBLE_COUNT = 10; // Initial number of songs to show
const SONGS_PER_PAGE = 20; // Number of songs to load on scroll
const DISTANCE_FROM_BOTTOM_PX = 300; // Distance from the bottom of the page to trigger loading more songs
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

const Home: React.FC<HomeProps> = ({ loadingSongs }) => {
    const [songs, setSongs] = useState<Array<FestivalSong> | null>(null);
    const [filterEpicGamesSongs, setFilterEpicGamesSongs] = useState(false);
    const [difficultyWeight, setDifficultyWeight] = useState(DIFFICULTY_WEIGHT_DEFAULT);

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

    const [visibleCount, setVisibleCount] = useState(VISIBLE_COUNT);

    useEffect(() => {
        updateRoute(Route.FORTNITE_FESTIVAL);

        loadingSongs.then(songs => {
            setSongs(songs);
        });
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

    const filteredSongs = songs?.filter(song => {
        if (!filterEpicGamesSongs) return true;

        return !song.artist.includes('Epic Games');
    }) ?? null;

    return <div>
        <div style={{ margin: '15px', fontSize: '1.2em' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.5em', textAlign: 'center', color: 'var(--novelty-orange)' }}>
                Fortnite Festival Difficulty Rankings
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Widget>
                    {toolsUi(filterEpicGamesSongs, setFilterEpicGamesSongs)}
                </Widget>

                <Widget>
                    {instrumentSelectorUi(selectedInstruments, instrument => onInstrumentToggled(instrument, false), false)}
                </Widget>

                <Widget>
                    {instrumentSelectorUi(selectedProInstruments, instrument => onInstrumentToggled(instrument, true), true)}
                </Widget>
            </div>

            <Widget>
                {difficultyWeightUi(difficultyWeight, setDifficultyWeight)}
            </Widget>

            {searchUi()}
        </div>

        <HorizontalLine thickness='4px' color='var(--novelty-blue)' />
        <VerticalSpacer height='15px' />

        {songsUi(filteredSongs, difficultyWeight, selectedInstruments, visibleCount)}
    </div >;
};

function searchUi(): JSX.Element {
    return <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0px' }}>
        <input
            style={{ fontSize: '1em', borderRadius: '15px', padding: '7.5px', flexGrow: 1 }}
            placeholder='Search (WIP)'
            onChange={e => { }}
        />
    </div>;
}

function toolsUi(filterEpicGamesSongs: boolean, setFilterEpicGamesSongs: (checked: boolean) => void): JSX.Element {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        gap: '10px',
        height: '100%'
    }}>
        <div><Button borderRadius={15} onClick={fetchLatestSongs}><div style={{ padding: '5px' }}>Fetch Latest Songs</div></Button></div>

        <div style={{ display: 'flex', gap: '10px' }}>
            <div>Filter Epic Games Songs</div>
            <ToggleSwitch enabled={filterEpicGamesSongs} onChange={checked => setFilterEpicGamesSongs(checked)} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
            <div>Filter Owned Songs (WIP)</div>
            <ToggleSwitch enabled={false} onChange={() => { }} />
        </div>
    </div>;
}

function instrumentSelectorUi(selectedInstruments: SelectedInstruments, instrumentToggled: (instrument: Instrument) => void, isPro: boolean): JSX.Element {
    const headerLabel = isPro ? 'Pro Instruments (WIP)' : 'Select Instruments';

    const description = isPro
        ? 'Select if you want the pro difficulty of an instruemnt included in the difficulty calculations.'
        : 'Select which instruments you want to include in the difficulty calculations.';

    const guitarLabel = isPro ? 'Pro Guitar' : 'Guitar';
    const bassLabel = isPro ? 'Pro Bass' : 'Bass';
    const drumsLabel = isPro ? 'Pro Drums' : 'Drums';
    const vocalsLabel = isPro ? 'Pro Vocals' : 'Vocals';

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
        <ToggleSwitch enabled={selectedInstruments.vocals} onChange={() => instrumentToggled('vocals')} />
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
                style={{ flexGrow: 1, accentColor: 'var(--novelty-orange)' }}
            />
            <div>{difficultyWeight}</div>
        </div>
    </div>;
}

function songsUi(
    songs: Array<FestivalSong> | null,
    difficultyWeight: number,
    selectedInstruments: SelectedInstruments,
    visibleCount: number
): JSX.Element {
    if (songs === null) return <Loading />;

    const sortedSongs = songs.sort((a, b) => {
        const aDifficulty = calculateOverallDifficulty(a, difficultyWeight, selectedInstruments);
        const bDifficulty = calculateOverallDifficulty(b, difficultyWeight, selectedInstruments);

        return aDifficulty - bDifficulty;
    });

    const visibleSongs = sortedSongs.slice(0, visibleCount); // Only show visibleCount songs

    const tracks = visibleSongs.map((song, index) => {
        const overallDifficulty = calculateOverallDifficulty(song, difficultyWeight, selectedInstruments);

        return <Track
            key={index}
            song={song}
            rank={sortedSongs.length - index}
            selectedInstruments={selectedInstruments}
            overallDifficulty={overallDifficulty}
        />;
    });

    return <div>
        {tracks}
    </div>;

    // const cellStyle: React.CSSProperties = {
    //     padding: '5px',
    //     border: '1px solid var(--novelty-blue)',
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     textAlign: 'center'
    // };

    // const isGreyedOut = (instrument?: Instrument) => {
    //     return instrument !== undefined && !selectedInstruments[instrument];
    // };

    // const createCell = (content: JSX.Element | string, instrument?: Instrument) => {
    //     const style: React.CSSProperties = { ...cellStyle };

    //     if (isGreyedOut(instrument)) {
    //         style.border = '1px solid grey';
    //         style.color = 'grey'
    //     }

    //     return <div style={style}>
    //         {content}
    //     </div>;
    // };

    // const rows = visibleSongs.map((song, index) => {
    //     const vocals = song.difficulties.vocals;
    //     const guitar = song.difficulties.proGuitar;
    //     const bass = song.difficulties.proBass;
    //     const drums = song.difficulties.drums;

    //     return <React.Fragment key={index}>
    //         {createCell(`#${sortedSongs.length - index}`)}
    //         <div style={cellStyle}><input type='checkbox' style={{ transform: 'scale(2)' }} disabled={true} /></div>
    //         {createCell(song.name)}
    //         {createCell(song.artist)}
    //         {createCell(<Difficulty level={vocals} isSelected={!isGreyedOut('vocals')} />, 'vocals')}
    //         {createCell(<Difficulty level={guitar} isSelected={!isGreyedOut('guitar')} />, 'guitar')}
    //         {createCell(<Difficulty level={bass} isSelected={!isGreyedOut('bass')} />, 'bass')}
    //         {createCell(<Difficulty level={drums} isSelected={!isGreyedOut('drums')} />, 'drums')}
    //         {createCell(calculateOverallDifficulty(song, difficultyWeight, selectedInstruments).toFixed(1))}
    //     </React.Fragment>;
    // });

    // const createHeaderCell = (text: string, onClick?: () => void, gridColumnSpan?: number) => {
    //     return <div style={{
    //         ...cellStyle,
    //         fontWeight: 'bold',
    //         fontSize: '1.25em',
    //         position: 'sticky',
    //         top: 0,
    //         backgroundColor: 'var(--novelty-background)',
    //         zIndex: 1,
    //         cursor: onClick ? 'pointer' : 'default',
    //         gridColumn: gridColumnSpan === undefined ? undefined : `span ${gridColumnSpan}`,
    //     }}
    //         onClick={onClick}>
    //         {text}
    //     </div>;
    // };

    // return <div style={{ margin: '15px' }}>
    //     <Track song={songs[0]} rank={123} overallDifficulty={4.3} />

    //     <VerticalSpacer height='15px' />

    //     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 3fr 3fr 1fr 1fr 1fr 1fr 1fr' }}>
    //         {createHeaderCell('Meta', undefined, 2)}
    //         {createHeaderCell('Song Details', undefined, 2)}
    //         {createHeaderCell('Difficulty', undefined, 5)}
    //         {createHeaderCell('Rank')}
    //         {createHeaderCell('Owned')}
    //         {createHeaderCell('Title')}
    //         {createHeaderCell('Artist')}
    //         {createHeaderCell('Vocals', () => onHeaderClick('vocals'))}
    //         {createHeaderCell('Pro Guitar', () => onHeaderClick('guitar'))}
    //         {createHeaderCell('Pro Bass', () => onHeaderClick('bass'))}
    //         {createHeaderCell('Drums', () => onHeaderClick('drums'))}
    //         {createHeaderCell('Overall')}
    //         {rows}
    //     </div>
    // </div>;
}

function calculateOverallDifficulty(song: FestivalSong, difficultyWeight: number, selectedInstruments: SelectedInstruments): number {
    const guitar = selectedInstruments.guitar ? song.difficulties.guitar ** difficultyWeight : 0;
    const bass = selectedInstruments.bass ? song.difficulties.bass ** difficultyWeight : 0;
    const drums = selectedInstruments.drums ? song.difficulties.drums ** difficultyWeight : 0;
    const vocals = selectedInstruments.vocals ? song.difficulties.vocals ** difficultyWeight : 0;

    const totalInstruments = (selectedInstruments.guitar ? 1 : 0) +
        (selectedInstruments.bass ? 1 : 0) +
        (selectedInstruments.drums ? 1 : 0) +
        (selectedInstruments.vocals ? 1 : 0);

    const meanPow = (guitar + bass + drums + vocals) / totalInstruments;
    const overallDifficulty = Math.pow(meanPow, 1 / difficultyWeight);

    return overallDifficulty;
}

export async function getFestivalSongs(): Promise<Array<FestivalSong>> {
    const data = await get(DataType.FORTNITE_FESTIVAL, { emit: () => { } });

    return data as Array<FestivalSong>;
}

function fetchLatestSongs() {
    deleteData(DataType.FORTNITE_FESTIVAL).then(() => window.location.reload());
}

export default Home;
