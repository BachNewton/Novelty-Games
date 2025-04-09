import { useEffect, useState } from "react";
import SongImporter from "./SongImporter";
import { selectFolder } from "../logic/Parser";
import MusicPlayer from "./MusicPlayer";
import { SongPackage } from "../logic/MusicDatabase";
import { Database, DatabaseNames } from "../../../util/Database";
import { Route, updateRoute } from "../../../ui/Routing";
import { NetworkService } from "../../../util/NetworkService";

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

    const updateSongsFromDb = () => musicDatabase.get('songs').then(songs => {
        networkService.log(`Loaded ${songs.length} songs from database`);
        setSongs(songs);
    });

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);
        updateSongsFromDb();
    }, []);

    const importNewSongs = () => {
        selectFolder().then(songPackages => {
            console.log('Selected files:', songPackages);

            const temp = musicDatabase.add('songs', ...songPackages);

            temp.forEach(async (promise, index) => {
                await promise;

                console.log('Added song to database');
                networkService.log(`Added song ${index + 1} of ${songPackages.length}`);
            });

            networkService.log('Adding songs to database...');
            updateSongsFromDb();
            setState(new MusicPlayerState());
            // setState(new SongImporterState(songPackages));
        });
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
        return <MusicPlayer importNewSongs={importNewSongs} deleteAllSongs={onDeleteAllSongs} songPackages={songs} />;
    } else {
        return <></>;
    }
};

export default Home;
