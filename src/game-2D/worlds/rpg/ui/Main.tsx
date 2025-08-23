import React, { useState } from "react";
import Button from "../../../../util/ui/Button";
import VerticalSpacer from "../../../../util/ui/Spacer";
import { TileType } from "../data/Tile";

interface MainProps {
    onTileSelected: (type: TileType) => void;
    onSave: () => void;
    isMouseOverPannel: (isOver: boolean) => void;
}

enum Mode { EDIT, PLAY }

const Main: React.FC<MainProps> = ({ onTileSelected, onSave, isMouseOverPannel }) => {
    const [mode, setMode] = useState<Mode>(Mode.EDIT);
    const [selectedTileType, setSelectedTileType] = useState<TileType>(TileType.GRASS);

    const onTileOptionClicked = (type: TileType) => {
        setSelectedTileType(type);
        onTileSelected(type);
    };

    const onModeSelected = () => setMode(pre => pre === Mode.EDIT ? Mode.PLAY : Mode.EDIT);

    const pannelContent = mode === Mode.EDIT
        ? editModeUi(
            mode,
            selectedTileType,
            onModeSelected,
            onTileOptionClicked,
            onSave
        )
        : playModeUi(
            onModeSelected
        );

    return <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%'
    }}>
        <div
            style={{
                border: '2px white solid',
                borderRadius: '15px',
                margin: '10px',
                padding: '10px',
                pointerEvents: 'auto',
                backgroundColor: 'rgba(0,0,0,0.5)'
            }}
            onMouseEnter={() => isMouseOverPannel(true)}
            onMouseLeave={() => isMouseOverPannel(false)}
        >
            {pannelContent}
        </div>
    </div>;
};

function editModeUi(
    mode: Mode,
    selectedTileType: TileType,
    onModeSelected: () => void,
    onTileOptionClicked: (type: TileType) => void,
    onSave: () => void
): JSX.Element {
    return <div>
        <div>Edit Pannel</div>
        <VerticalSpacer height={15} />
        <Button onClick={onModeSelected}>Play Mode</Button>
        <VerticalSpacer height={15} />
        <div>Titles</div>
        {tileOption(onTileOptionClicked, TileType.GRASS, selectedTileType)}
        {tileOption(onTileOptionClicked, TileType.TREE, selectedTileType)}
        <VerticalSpacer height={15} />
        <Button onClick={onSave}>Save</Button>
        <Button onClick={() => console.log('Button clicked')}>Load</Button>
    </div>;
}

function playModeUi(onModeSelected: () => void): JSX.Element {
    return <div>
        <div>Play Pannel</div>
        <VerticalSpacer height={15} />
        <Button onClick={onModeSelected}>Edit Mode</Button>
    </div>;
}

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

export function getOverlay(
    onTileSelected: (type: TileType) => void,
    onSave: () => void,
    isMouseOverPannel: (isOver: boolean) => void
): JSX.Element {
    return <Main
        onTileSelected={onTileSelected}
        onSave={onSave}
        isMouseOverPannel={isMouseOverPannel}
    />;
}
