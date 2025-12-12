import { useEffect, useRef, useState } from "react";
import MusicPlayer from "./MusicPlayer";
import { NetworkService } from "../../../util/networking/NetworkService";
import { createSongParser } from "../logic/SongParser";
import { MusicIndex } from "../logic/MusicIndex";

interface HomeProps {
    networkService: NetworkService<void>;
    musicIndexPromise: Promise<MusicIndex>;
}

const Home: React.FC<HomeProps> = ({ networkService, musicIndexPromise }) => {
    const songParser = useRef(createSongParser(networkService));
    const [musicIndex, setMusicIndex] = useState<MusicIndex | null>(null);

    useEffect(() => {
        musicIndexPromise.then(loadedMusicIndex => setMusicIndex(loadedMusicIndex));
    }, []);

    return <MusicPlayer
        songParser={songParser.current}
        musicIndex={musicIndex}
    />;
};

export default Home;
