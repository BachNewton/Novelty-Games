import { useEffect, useState } from "react";
import { get } from "../../../trivia/logic/Repository";
import { DataType, FestivalSong } from "../../../trivia/data/Data";
import Loading from "../../../util/ui/Loading";
import { Route, updateRoute } from "../../../ui/Routing";

interface HomeProps {
    loadingSongs: Promise<Array<FestivalSong>>;
}

const Home: React.FC<HomeProps> = ({ loadingSongs }) => {
    const [songs, setSongs] = useState<Array<FestivalSong> | null>(null);

    useEffect(() => {
        updateRoute(Route.FORTNITE_FESTIVAL);

        loadingSongs.then(songs => {
            setSongs(songs);
        });
    }, []);

    return <div style={{ color: 'white', fontSize: '1.5em' }}>
        <div style={{ margin: '15px' }}>
            <input type='checkbox' style={{ transform: 'scale(2.5)', marginRight: '15px' }} />
            <label>Pro Guitar</label>
            <br />
            <input type='checkbox' style={{ transform: 'scale(2.5)', marginRight: '15px' }} />
            <label>Drums</label>
            <br />
            <label>Difficulty Scalar</label>
            <input type='number' style={{ fontSize: '1em', width: '3em', marginLeft: '15px' }} value={1} />
        </div>

        <div style={{ borderTop: '3px solid var(--novelty-blue)', margin: '15px 0px' }} />

        {songsUi(songs)}
    </div>;
};

function songsUi(songs: Array<FestivalSong> | null): JSX.Element {
    if (songs === null) return <Loading />;

    const elements = songs.map((song, index) => {
        return <div key={index} style={{}}>
            {song.name}
        </div>
    });

    return <div style={{ margin: '15px' }}>{elements}</div>;
}

export async function getFestivalSongs(): Promise<Array<FestivalSong>> {
    const data = await get(DataType.FORTNITE_FESTIVAL, { emit: () => { } });

    return data as Array<FestivalSong>;
}

export default Home;
