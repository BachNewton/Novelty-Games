import { useEffect, useState } from "react";
import SongImporter from "./SongImporter";
import { ParsedSongPackage, parseSongPackages, selectFolder } from "../logic/Parser";
import MusicPlayer from "./MusicPlayer";
import { SongPackage } from "../logic/MusicDatabase";
import { Database, DatabaseNames } from "../../../util/Database";
import { Route, updateRoute } from "../../../ui/Routing";
import { FolderSelectedState, DatabaseOpenedState, ProgressState, SelectingFolderState, AddSongsToDatabaseState, DatabaseTransactionCompleteState, AddingSongsState, CompleteState } from "./MusicPlayerProgressBar";
import { DownloadFileData, NetworkService } from "../../../util/networking/NetworkService";

interface HomeProps {
    musicDatabase: Database<DatabaseNames.MUSIC>;
    networkService: NetworkService<void>;
}

interface State { }

class MusicPlayerState implements State { }

class SongImporterState implements State {
    songPackages: SongPackage[];

    constructor(songPackages: SongPackage[]) {
        this.songPackages = songPackages;
    }
}

const Home: React.FC<HomeProps> = ({ musicDatabase, networkService }) => {
    const [state, setState] = useState<State>(new MusicPlayerState());
    const [progressState, setProgressState] = useState<ProgressState | null>(null);

    const updateSongsFromDb = async () => {
        const songs = await musicDatabase.get('songs');
        console.log('Loaded songs from database:', songs);
    };

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);
        // updateSongsFromDb();
    }, []);

    const onSongClicked = (songPackage: SongPackage) => {
        console.log('Selected song:', songPackage);
        musicDatabase.add('songs', songPackage);
        updateSongsFromDb();
        setState(new MusicPlayerState());
    };

    if (state instanceof SongImporterState) {
        return <SongImporter songPackages={state.songPackages} onSongClicked={onSongClicked} />;
    } else if (state instanceof MusicPlayerState) {
        return <MusicPlayer
            progressState={progressState}
        />;
    } else {
        return <></>;
    }
};

export default Home;
