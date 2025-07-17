import { useEffect, useRef } from "react";
import MusicPlayer from "./MusicPlayer";
import { Route, updateRoute } from "../../../ui/Routing";
import { NetworkService } from "../../../util/networking/NetworkService";
import { createSongParser } from "../logic/SongParser";
import { createMusicIndex } from "../logic/MusicIndex";

interface HomeProps {
    networkService: NetworkService<void>;
}

const Home: React.FC<HomeProps> = ({ networkService }) => {
    const songParser = useRef(createSongParser(networkService));
    const musicIndex = useRef(createMusicIndex());

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);
    }, []);

    return <MusicPlayer
        songParser={songParser.current}
        musicIndex={musicIndex.current}
    />;
};

export default Home;
