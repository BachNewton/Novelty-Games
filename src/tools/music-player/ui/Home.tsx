import { useEffect, useState } from "react";
import MusicPlayer from "./MusicPlayer";
import SongImporter from "./SongImporter";
import { selectFolder } from "../logic/Parser";
import NewMusicPlayer from "./NewMusicPlayer";
import { createMusicDatabase, MusicDatabaseTables, SongPackage } from "../logic/MusicDatabase";
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

    useEffect(() => {
        const db = createMusicDatabase();
        db.get('songs').then(data => console.log(data));
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
        setState(new MusicPlayerState(songPackage));
    };

    if (state instanceof SongImporterState) {
        return <SongImporter songPackages={state.songPackages} onSongClicked={onSongClicked} />;
    } else if (state instanceof MusicPlayerState) {
        return <NewMusicPlayer importNewSongs={importNewSongs} />;
        // return <MusicPlayer songPackage={state.songPackage} onFolderSelect={onFolderSelect} />;
    } else {
        throw new Error('State not supported: ' + state);
    }
};

export default Home;
