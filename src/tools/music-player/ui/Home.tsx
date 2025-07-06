import { useEffect, useRef, useState } from "react";
import MusicPlayer from "./MusicPlayer";
import { Database, DatabaseNames } from "../../../util/Database";
import { Route, updateRoute } from "../../../ui/Routing";
import { FolderSelectedState, DatabaseOpenedState, ProgressState, SelectingFolderState, AddSongsToDatabaseState, DatabaseTransactionCompleteState, AddingSongsState, CompleteState } from "./MusicPlayerProgressBar";
import { NetworkService } from "../../../util/networking/NetworkService";
import { createSongParser } from "../logic/Parser2";

interface HomeProps {
    musicDatabase: Database<DatabaseNames.MUSIC>;
    networkService: NetworkService<void>;
}

const Home: React.FC<HomeProps> = ({ musicDatabase, networkService }) => {
    const songParser = useRef(createSongParser(networkService));
    const [progressState, setProgressState] = useState<ProgressState | null>(null);

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);
    }, []);

    return <MusicPlayer
        networkService={networkService}
        progressState={progressState}
        songParser={songParser.current}
    />;
};

export default Home;
