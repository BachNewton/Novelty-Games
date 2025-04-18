import { useEffect, useState } from "react";
import SongImporter from "./SongImporter";
import { ParsedSongPackage, parseSongPackages, selectFolder } from "../logic/Parser";
import MusicPlayer from "./MusicPlayer";
import { SongPackage } from "../logic/MusicDatabase";
import { Database, DatabaseNames } from "../../../util/Database";
import { Route, updateRoute } from "../../../ui/Routing";
import { FolderSelectedState, DatabaseOpenedState, ProgressState, SelectingFolderState, AddSongsToDatabaseState, DatabaseTransactionCompleteState, AddingSongsState, CompleteState } from "./MusicPlayerProgressBar";
import { wait } from "../../../util/Wait";

interface HomeProps {
    musicDatabase: Database<DatabaseNames.MUSIC>;
}

interface State { }

class MusicPlayerState implements State { }

class SongImporterState implements State {
    songPackages: SongPackage[];

    constructor(songPackages: SongPackage[]) {
        this.songPackages = songPackages;
    }
}

const Home: React.FC<HomeProps> = ({ musicDatabase }) => {
    const [state, setState] = useState<State>(new MusicPlayerState());
    const [songs, setSongs] = useState<ParsedSongPackage[] | null>(null);
    const [progressState, setProgressState] = useState<ProgressState | null>(null);

    const updateSongsFromDb = async () => {
        const songs = await musicDatabase.get('songs');
        console.log('Loaded songs from database:', songs);
        setSongs(await parseSongPackages(songs));
    };

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);
        updateSongsFromDb();
    }, []);

    const importNewSongs = async () => {
        setSongs(null);
        console.log('Importing new songs...');
        setProgressState(new SelectingFolderState());

        const songPackages = await selectFolder();
        console.log('Selected files:', songPackages);
        setProgressState(new FolderSelectedState());

        // const addRequest = musicDatabase.add('songs', ...songPackages);

        // addRequest.openDatabase.then(() => {
        //     console.log('Database opened for adding songs');
        //     setProgressState(new DatabaseOpenedState());
        // });

        // addRequest.transactionComplete.then(async () => {
        //     console.log('Transaction completed for adding songs');
        //     setProgressState(new DatabaseTransactionCompleteState());
        //     await wait(2000);
        //     setProgressState(null);
        // });

        // addRequest.add.forEach(async (request, index) => {
        //     await request;

        //     console.log(`Added song ${index + 1} of ${songPackages.length}`);
        //     setProgressState(new AddSongsToDatabaseState(index / addRequest.add.length));
        // });

        // await addRequest.transactionComplete;

        setSongs(songPackages);
        setState(new MusicPlayerState());

        for (let i = 0; i < songPackages.length; i++) {
            const song = songPackages[i];

            setProgressState(new AddingSongsState(i + 1, songPackages.length));

            await musicDatabase.add2('songs', song);
        }

        console.log('All songs added to database');
        setProgressState(new CompleteState());
        // updateSongsFromDb();

        await wait(2000);
        setProgressState(null);
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
        await musicDatabase.delete();
        console.log('All songs deleted');
        updateSongsFromDb();
    };

    if (state instanceof SongImporterState) {
        return <SongImporter songPackages={state.songPackages} onSongClicked={onSongClicked} />;
    } else if (state instanceof MusicPlayerState) {
        return <MusicPlayer
            importNewSongs={importNewSongs}
            deleteAllSongs={onDeleteAllSongs}
            songs={songs}
            progressState={progressState}
        />;
    } else {
        return <></>;
    }
};

export default Home;
