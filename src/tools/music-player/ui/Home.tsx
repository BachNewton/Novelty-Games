import { useState } from "react";
import MusicPlayer from "./MusicPlayer";
import SongImporter from "./SongImporter";
import { selectFolder, SongPackage } from "../logic/Parser";

interface HomeProps { }

interface State { }

class MusicPlayerState implements State { }

class SongImporterState implements State {
    songPackages: SongPackage[];

    constructor(songPackages: SongPackage[]) {
        this.songPackages = songPackages;
    }
}

const Home: React.FC<HomeProps> = ({ }) => {
    const [state, setState] = useState<State>(new MusicPlayerState());

    const onFolderSelect = () => {
        selectFolder().then(songPackages => {
            console.log('Selected files:', songPackages);
            setState(new SongImporterState(songPackages));
        });
    };

    if (state instanceof SongImporterState) {
        return <SongImporter songPackages={state.songPackages} />;
    } else {
        return <MusicPlayer onFolderSelect={onFolderSelect} />;
    }
};

export default Home;
