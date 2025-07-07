import { useEffect, useRef } from "react";
import MusicPlayer from "./MusicPlayer";
import { Route, updateRoute } from "../../../ui/Routing";
import { NetworkService } from "../../../util/networking/NetworkService";
import { createSongParser } from "../logic/SongParser";

interface HomeProps {
    networkService: NetworkService<void>;
}

const Home: React.FC<HomeProps> = ({ networkService }) => {
    const songParser = useRef(createSongParser(networkService));

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);
    }, []);

    return <MusicPlayer
        songParser={songParser.current}
    />;
};

export default Home;
