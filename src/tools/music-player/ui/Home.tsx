import { useState } from "react";
import MusicPlayer from "./MusicPlayer";
import SongImporter from "./SongImporter";
import { selectFolder, SongFile } from "../logic/Parser";

interface HomeProps { }

interface State { }

class MusicPlayerState implements State { }

class SongImporterState implements State {
    songFiles: SongFile[];

    constructor(songFiles: SongFile[]) {
        this.songFiles = songFiles;
    }
}

const Home: React.FC<HomeProps> = ({ }) => {
    const [state, setState] = useState<State>(new MusicPlayerState());

    const onFolderSelect = () => {
        selectFolder().then(songFiles => {
            console.log('Selected files:', songFiles);
            setState(new SongImporterState(songFiles));
        });
    };

    if (state instanceof SongImporterState) {
        return <SongImporter songFiles={state.songFiles} />;
    } else {
        return <MusicPlayer onFolderSelect={onFolderSelect} />;
    }
};

export default Home;
