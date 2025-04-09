import { useEffect, useState } from "react";
import SongImporter from "./SongImporter";
import { selectFolder } from "../logic/Parser";
import MusicPlayer from "./MusicPlayer";
import { SongPackage } from "../logic/MusicDatabase";
import { Database, DatabaseNames } from "../../../util/Database";
import { Route, updateRoute } from "../../../ui/Routing";

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
    const [songs, setSongs] = useState<SongPackage[] | null>(null);

    const updateSongsFromDb = () => musicDatabase.get('songs').then(songs => setSongs(songs));

    useEffect(() => {
        updateRoute(Route.MUSIC_PLAYER);
        updateSongsFromDb();
    }, []);

    const importNewSongs = () => {
        selectFolder().then(songPackages => {
            console.log('Selected files:', songPackages);

            const temp = musicDatabase.add('songs', ...songPackages);

            temp.forEach(async promise => {
                await promise;

                console.log('Added song to database');
            });

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

    if (state instanceof SongImporterState) {
        return <SongImporter songPackages={state.songPackages} onSongClicked={onSongClicked} />;
    } else if (state instanceof MusicPlayerState) {
        return <MusicPlayer importNewSongs={importNewSongs} songPackages={songs} />;
    } else {
        return <></>;
    }
};

export default Home;
