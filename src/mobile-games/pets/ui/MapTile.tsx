import { useState } from "react";
import { TILE_SIZE } from "../logic/MapProjection";
import { buildTileUrl, Tile } from "../logic/PetMapLayout";

interface MapTileProps {
    tile: Tile;
    left: number;
    top: number;
}

// Remembered across pans so a tile that's already known to be missing never flashes a broken image again.
const missingTiles = new Set<string>();

const MapTile: React.FC<MapTileProps> = ({ tile, left, top }) => {
    const [isMissing, setIsMissing] = useState(missingTiles.has(tile.key));

    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`
    };

    if (isMissing) return <div style={{ ...style, ...placeholderStyle() }} />;

    return <img
        src={buildTileUrl(tile.zoom, tile.x, tile.y)}
        alt=''
        draggable={false}
        style={{ ...style, display: 'block', userSelect: 'none' }}
        onError={() => {
            missingTiles.add(tile.key);
            setIsMissing(true);
        }}
    />;
};

/** A warm pastel stand-in with a couple of soft paw-print smudges, so gaps read as part of the artwork. */
function placeholderStyle(): React.CSSProperties {
    return {
        backgroundColor: '#fbeee6',
        backgroundImage: `
            radial-gradient(circle at 30% 28%, rgba(0,206,209,0.13) 0 14px, transparent 15px),
            radial-gradient(circle at 22% 44%, rgba(0,206,209,0.10) 0 7px, transparent 8px),
            radial-gradient(circle at 38% 44%, rgba(0,206,209,0.10) 0 7px, transparent 8px),
            radial-gradient(circle at 72% 70%, rgba(255,45,149,0.11) 0 16px, transparent 17px),
            linear-gradient(135deg, #fbf1ea 0%, #f9edef 100%)
        `
    };
}

export default MapTile;
