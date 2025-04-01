import { useEffect, useState } from "react";
import { SongPackage } from "../logic/Parser";

interface SongImporterProps {
    songPackages: SongPackage[];
}

const SongImporter: React.FC<SongImporterProps> = ({ songPackages }) => {
    const [buttonTexts, setButtonTexts] = useState<string[]>([]);

    // useEffect(() => {
    //     const iniFiles = songPackages.filter(file => file.file.name === 'song.ini');

    //     Promise.all(iniFiles.map(iniFile => getNameAndArtist(iniFile.file))).then(nameAndArtists => {
    //         setButtonTexts(nameAndArtists);
    //     });
    // }, []);

    const onSongClicked = (index: number) => {
        const selectedSong = songPackages[index];
    };

    const buttons = songPackages.map((songPackage, index) => <button key={index} style={{ fontSize: '1em', padding: '5px' }}>{songPackage.id}</button>);

    return <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '15px' }}>
        {buttons}
    </div>;
};

export default SongImporter;
