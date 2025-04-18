import { useEffect, useState } from "react";
import SongImporter from "./SongImporter";
import { selectFolder } from "../logic/Parser";
import MusicPlayer from "./MusicPlayer";
import { SongPackage } from "../logic/MusicDatabase";
import { Database, DatabaseNames } from "../../../util/Database";
import { Route, updateRoute } from "../../../ui/Routing";
import { NetworkService } from "../../../util/networking/NetworkService";
import { FolderSelectedState, DatabaseOpenedState, ProgressState, SelectingFolderState, AddSongsToDatabaseState, DatabaseTransactionCompleteState } from "./MusicPlayerProgressBar";
import { wait } from "../../../util/Wait";

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
    const [songs, setSongs] = useState<SongPackage[] | null>(null);
    const [progressState, setProgressState] = useState<ProgressState | null>(null);

    const updateSongsFromDb = async () => {
        const songs = await musicDatabase.get('songs');
        console.log('Loaded songs from database:', songs);
        networkService.log(`Loaded ${songs.length} songs from database`);
        setSongs(songs);
    };

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);
        updateSongsFromDb();
    }, []);

    const importNewSongs = async () => {
        setSongs(null);
        console.log('Importing new songs...');
        networkService.log('Importing new songs...');
        setProgressState(new SelectingFolderState());

        const songPackages = await selectFolder();
        console.log('Selected files:', songPackages);
        networkService.log(`Selected ${songPackages.length} files`);
        setProgressState(new FolderSelectedState());

        const addRequest = musicDatabase.add('songs', ...songPackages);
        networkService.log('Adding songs to database...');

        addRequest.openDatabase.then(() => {
            console.log('Database opened for adding songs');
            networkService.log('Database opened for adding songs');
            setProgressState(new DatabaseOpenedState());
        });

        addRequest.transactionComplete.then(async () => {
            console.log('Transaction completed for adding songs');
            networkService.log('Transaction completed for adding songs');
            setProgressState(new DatabaseTransactionCompleteState());
            await wait(2000);
            setProgressState(null);
        });

        addRequest.add.forEach(async (request, index) => {
            await request;

            console.log(`Added song ${index + 1} of ${songPackages.length}`);
            networkService.log(`Added song ${index + 1} of ${songPackages.length}`);
            setProgressState(new AddSongsToDatabaseState(index / addRequest.add.length));
        });

        await addRequest.transactionComplete;

        networkService.log('All songs added to database');
        console.log('All songs added to database');
        updateSongsFromDb();

        setState(new MusicPlayerState());
    };

    const onSongClicked = (songPackage: SongPackage) => {
        console.log('Selected song:', songPackage);
        musicDatabase.add('songs', songPackage);
        updateSongsFromDb();
        setState(new MusicPlayerState());
    };

    const onDeleteAllSongs = async () => {
        setSongs(null);
        console.log('Deleting all songs...');
        networkService.log('Deleting all songs...');
        await musicDatabase.delete();
        console.log('All songs deleted');
        networkService.log('All songs deleted');
        updateSongsFromDb();
    };

    if (state instanceof SongImporterState) {
        return <SongImporter songPackages={state.songPackages} onSongClicked={onSongClicked} />;
    } else if (state instanceof MusicPlayerState) {
        return <MusicPlayer
            importNewSongs={importNewSongs}
            deleteAllSongs={onDeleteAllSongs}
            songPackages={songs}
            progressState={progressState}
        />;
    } else {
        return <></>;
    }
};

export default Home;
