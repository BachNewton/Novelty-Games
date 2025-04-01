import { useEffect, useState } from "react";
import MusicPlayer from "./MusicPlayer";
import SongImporter from "./SongImporter";
import { selectFolder, SongPackage } from "../logic/Parser";
import NewMusicPlayer from "./NewMusicPlayer";
import { createDatabase } from "../../../util/Database";

interface HomeProps { }

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

interface TempData {
    temp: number;
}

const Home: React.FC<HomeProps> = ({ }) => {
    const [state, setState] = useState<State>(new MusicPlayerState());

    useEffect(() => {
        // createMusicDatabase().add();
        // const tables: Record<string, any> = {
        //     'tableName': typeof TempData
        // };
        const db = createDatabase<{ 'tableName': TempData }>('database_name', ['tableName']);
        db.add('tableName', { temp: Math.random() });
        db.get('tableName').then(data => console.log(data));
        // const data = db.get('tableName');
    }, []);

    const importNewSongs = () => {
        selectFolder().then(songPackages => {
            console.log('Selected files:', songPackages);
            setState(new SongImporterState(songPackages));
        });
    };

    const onSongClicked = (songPackage: SongPackage) => {
        console.log('Selected song:', songPackage);
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
