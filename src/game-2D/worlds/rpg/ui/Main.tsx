import React, { useState } from "react";
import Button from "../../../../util/ui/Button";
import VerticalSpacer from "../../../../util/ui/Spacer";
import { TileType } from "../data/Tile";

interface MainProps {
    onTileSelected: (type: TileType) => void;
}

const Main: React.FC<MainProps> = ({ onTileSelected }) => {
    const [selectedTileType, setSelectedTileType] = useState<TileType>(TileType.GRASS);

    const onTileOptionClicked = (type: TileType) => {
        setSelectedTileType(type);
        onTileSelected(type);
    };

    return <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%'
    }}>
        <div style={{
            border: '2px white solid',
            borderRadius: '15px',
            height: '75%',
            margin: '10px',
            padding: '10px',
            pointerEvents: 'auto',
            backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
            <div>Edit Pannel</div>
            <VerticalSpacer height={15} />
            <Button onClick={() => console.log('Button clicked')}>Button</Button>
            <VerticalSpacer height={15} />
            <div>Titles</div>
            {tileOption(onTileOptionClicked, TileType.GRASS, selectedTileType)}
            {tileOption(onTileOptionClicked, TileType.TREE, selectedTileType)}
        </div>
    </div>;
};

function tileOption(onClick: (type: TileType) => void, type: TileType, selectedType: TileType): JSX.Element {
    const style: React.CSSProperties = {
        width: '25px',
        height: '25px',
        backgroundColor: getTileColor(type),
        border: type === selectedType ? '1px solid white' : undefined,
        boxSizing: 'border-box'
    };

    return <div onClick={() => onClick(type)} style={style} />;
}

function getTileColor(type: TileType): string | undefined {
    switch (type) {
        case TileType.GRASS: return 'green';
        case TileType.TREE: return 'brown';
        default: return undefined;
    }
}

export function getOverlay(onTileSelected: (type: TileType) => void): JSX.Element {
    return <Main
        onTileSelected={onTileSelected}
    />;
}
