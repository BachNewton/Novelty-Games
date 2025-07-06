import { useEffect, useRef } from "react";
import MusicPlayer from "./MusicPlayer";
import { Database, DatabaseNames } from "../../../util/Database";
import { Route, updateRoute } from "../../../ui/Routing";
import { NetworkService } from "../../../util/networking/NetworkService";
import { createSongParser } from "../logic/SongParser";

interface HomeProps {
    musicDatabase: Database<DatabaseNames.MUSIC>;
    networkService: NetworkService<void>;
}

const Home: React.FC<HomeProps> = ({ musicDatabase, networkService }) => {
    const songParser = useRef(createSongParser(networkService));

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);
    }, []);

    return <MusicPlayer
        songParser={songParser.current}
    />;
};

export default Home;
