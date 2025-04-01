import { useEffect, useState } from "react";
import SongImporter from "./SongImporter";
import { selectFolder } from "../logic/Parser";
import NewMusicPlayer from "./NewMusicPlayer";
import { MusicDatabaseTables, SongPackage } from "../logic/MusicDatabase";
import { Database } from "../../../util/Database";

interface HomeProps {
    musicDatabase: Database<MusicDatabaseTables>;
}

interface State { }

class MusicPlayerState implements State {
    songPackage?: SongPackage;

    constructor(songPackage?: SongPackage) {
        this.songPackage = songPackage;
    }
}

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
        updateSongsFromDb();
    }, []);

    const importNewSongs = () => {
        selectFolder().then(songPackages => {
            console.log('Selected files:', songPackages);
            setState(new SongImporterState(songPackages));
        });
    };

    const onSongClicked = (songPackage: SongPackage) => {
        console.log('Selected song:', songPackage);
        musicDatabase.add('songs', songPackage);
        updateSongsFromDb();
        setState(new MusicPlayerState(songPackage));
    };

    if (state instanceof SongImporterState) {
        return <SongImporter songPackages={state.songPackages} onSongClicked={onSongClicked} />;
    } else if (state instanceof MusicPlayerState) {
        return <NewMusicPlayer importNewSongs={importNewSongs} songPackages={songs} />;
    } else {
        return <></>;
    }
};

export default Home;
