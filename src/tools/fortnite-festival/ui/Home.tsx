import { useEffect, useState } from "react";
import { get } from "../../../trivia/logic/Repository";
import { DataType, FestivalSong } from "../../../trivia/data/Data";
import Loading from "../../../util/ui/Loading";
import { Route, updateRoute } from "../../../ui/Routing";
import React from "react";

interface HomeProps {
    loadingSongs: Promise<Array<FestivalSong>>;
}

const Home: React.FC<HomeProps> = ({ loadingSongs }) => {
    const [songs, setSongs] = useState<Array<FestivalSong> | null>(null);
    const [difficultyScalar, setDifficultyScalar] = useState<string>('1.0');

    useEffect(() => {
        updateRoute(Route.FORTNITE_FESTIVAL);

        loadingSongs.then(songs => {
            setSongs(songs);
        });
    }, []);

    return <div style={{ color: 'white' }}>
        <div style={{ margin: '15px', fontSize: '1.5em' }}>
            <input type='checkbox' style={{ transform: 'scale(2.5)', marginRight: '15px' }} checked={true} disabled={true} />
            <label>Pro Guitar</label>
            <br />
            <input type='checkbox' style={{ transform: 'scale(2.5)', marginRight: '15px' }} checked={true} disabled={true} />
            <label>Drums</label>
            <br />
            <label>Difficulty Scalar</label>
            <input
                type='text'
                style={{ fontSize: '1em', width: '3em', marginLeft: '15px' }}
                value={difficultyScalar}
                onChange={e => setDifficultyScalar(e.target.value)}
                disabled={true}
            />
        </div>

        <div style={{ borderTop: '3px solid var(--novelty-blue)', margin: '15px 0px' }} />

        {songsUi(songs, difficultyScalar)}
    </div>;
};

function songsUi(songs: Array<FestivalSong> | null, difficultyScalar: string): JSX.Element {
    if (songs === null) return <Loading />;

    const sortedSongs = songs.sort((a, b) => {
        const aDifficulty = calculateBandDifficulty(a, difficultyScalar);
        const bDifficulty = calculateBandDifficulty(b, difficultyScalar);

        return aDifficulty - bDifficulty;
    });

    const cellStyle: React.CSSProperties = {
        padding: '5px',
        border: '1px solid var(--novelty-blue)',
        textAlign: 'center'
    };

    const createCell = (text: string, fontSize?: string) => {
        return <div style={cellStyle}>
            {text}
        </div>;
    };

    const rows = sortedSongs.map((song, index) => {
        return <React.Fragment key={index}>
            {createCell(song.name)}
            {createCell(song.artist)}
            {createCell(song.difficulties.proGuitar.toString())}
            {createCell(song.difficulties.drums.toString())}
            {createCell(calculateBandDifficulty(song, difficultyScalar).toString())}
        </React.Fragment>;
    });

    const createHeaderCell = (text: string) => {
        return <div style={{ ...cellStyle, fontWeight: 'bold', fontSize: '1.5em' }}>
            {text}
        </div>;
    };

    return <div style={{ margin: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
        {createHeaderCell('Song')}
        {createHeaderCell('Artist')}
        {createHeaderCell('Pro Guitar Difficulty')}
        {createHeaderCell('Drums Difficulty')}
        {createHeaderCell('Band Difficulty')}
        {rows}
    </div>;
}

function calculateBandDifficulty(song: FestivalSong, difficultyScalar: string): number {
    const totalDifficulty = song.difficulties.proGuitar + song.difficulties.drums;

    return totalDifficulty;
}

export async function getFestivalSongs(): Promise<Array<FestivalSong>> {
    const data = await get(DataType.FORTNITE_FESTIVAL, { emit: () => { } });

    return data as Array<FestivalSong>;
}

export default Home;
