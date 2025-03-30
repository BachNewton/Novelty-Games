import { useEffect, useState } from "react";
import { getNameAndArtist, SongFile } from "../logic/Parser";

interface SongImporterProps {
    songFiles: SongFile[];
}

const SongImporter: React.FC<SongImporterProps> = ({ songFiles }) => {
    const [buttonTexts, setButtonTexts] = useState<string[]>([]);

    useEffect(() => {
        const iniFiles = songFiles.filter(file => file.file.name === 'song.ini');

        Promise.all(iniFiles.map(iniFile => getNameAndArtist(iniFile.file))).then(nameAndArtists => {
            setButtonTexts(nameAndArtists);
        });
    }, []);

    const buttons = buttonTexts.map((text, index) => <button key={index} style={{ fontSize: '1em', padding: '5px' }}>{text}</button>);

    return <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '15px' }}>
        {buttons}
    </div>;
};

export default SongImporter;
