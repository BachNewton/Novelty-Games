import { useEffect, useState } from "react";
import { SongPackage } from "../logic/MusicDatabase";

interface SongImporterProps {
    songPackages: SongPackage[];
    onSongClicked: (songPackage: SongPackage) => void;
}

const SongImporter: React.FC<SongImporterProps> = ({ songPackages, onSongClicked }) => {
    const buttons = songPackages.map((songPackage, index) => <button
        key={index}
        onClick={() => onSongClicked(songPackage)}
        style={{ fontSize: '1em', padding: '5px' }}
    >{songPackage.folderName}</button>);

    return <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '15px' }}>
        {buttons}
    </div>;
};

export default SongImporter;
