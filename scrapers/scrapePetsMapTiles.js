import fs from 'fs';
import path from 'path';

// Stamen Watercolor map tiles, hosted by Cooper Hewitt / Smithsonian Institution.
// Tiles are CC BY 3.0 (Stamen Design); OpenStreetMap data is CC BY-SA 2.0.
// No API key required. See public/pets-map-tiles/ATTRIBUTION.md.
const TILE_URL = (z, x, y) => `https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/${z}/${x}/${y}.jpg`;

const OUTPUT_DIR = 'public/pets-map-tiles';
const USER_AGENT = 'Novelty-Games-PetsMapTiles/1.0 (https://github.com/BachNewton/Novelty-Games)';
const REQUEST_DELAY_MS = 150;
const MAX_TOTAL_BYTES = 15 * 1024 * 1024;
const MAX_ATTEMPTS = 5;
const RETRY_BACKOFF_MS = 2000;

// Central Helsinki
const BOUNDS = {
    minLat: 60.130,
    maxLat: 60.212,
    minLon: 24.850,
    maxLon: 24.985
};

const MIN_ZOOM = 11;
const MAX_ZOOM = 15;

const lonToTileX = (lon, zoom) => Math.floor((lon + 180) / 360 * Math.pow(2, zoom));

const latToTileY = (lat, zoom) => {
    const radians = lat * Math.PI / 180;
    const mercator = Math.log(Math.tan(radians) + 1 / Math.cos(radians));
    return Math.floor((1 - mercator / Math.PI) / 2 * Math.pow(2, zoom));
};

const tileRangeForZoom = (zoom) => {
    const maxIndex = Math.pow(2, zoom) - 1;
    const clamp = (value) => Math.min(Math.max(value, 0), maxIndex);

    return {
        minX: clamp(lonToTileX(BOUNDS.minLon, zoom)),
        maxX: clamp(lonToTileX(BOUNDS.maxLon, zoom)),
        // Tile Y grows southward, so the northern edge gives the smaller Y.
        minY: clamp(latToTileY(BOUNDS.maxLat, zoom)),
        maxY: clamp(latToTileY(BOUNDS.minLat, zoom))
    };
};

const tilesForZoom = (zoom) => {
    const range = tileRangeForZoom(zoom);
    const tiles = [];

    for (let x = range.minX; x <= range.maxX; x++) {
        for (let y = range.minY; y <= range.maxY; y++) {
            tiles.push({ z: zoom, x: x, y: y });
        }
    }

    return tiles;
};

const tilePath = (tile) => path.join(OUTPUT_DIR, String(tile.z), String(tile.x), `${tile.y}.jpg`);

const sizeOnDisk = (filePath) => {
    try {
        return fs.statSync(filePath).size;
    } catch {
        return null;
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const formatMegabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

async function fetchWithRetry(url) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            return await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        } catch (error) {
            if (attempt === MAX_ATTEMPTS) throw error;

            const backoff = RETRY_BACKOFF_MS * attempt;
            console.log(`  Network error (${error.cause?.code ?? error.message}), retrying in ${backoff}ms`);
            await delay(backoff);
        }
    }
}

async function downloadTile(tile) {
    const destination = tilePath(tile);

    const existingSize = sizeOnDisk(destination);
    if (existingSize !== null && existingSize > 0) {
        return { skipped: true, bytes: existingSize };
    }

    const url = TILE_URL(tile.z, tile.x, tile.y);
    const response = await fetchWithRetry(url);

    if (!response.ok) {
        // The original Stamen tileset has genuine holes, especially at high zoom.
        console.log(`  Missing (HTTP ${response.status}): ${tile.z}/${tile.x}/${tile.y}`);
        return { missing: true, bytes: 0 };
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    await fs.promises.mkdir(path.dirname(destination), { recursive: true });
    await fs.promises.writeFile(destination, buffer);

    await delay(REQUEST_DELAY_MS);

    return { downloaded: true, bytes: buffer.length };
}

async function downloadZoom(zoom, bytesAlreadyUsed) {
    const tiles = tilesForZoom(zoom);
    const range = tileRangeForZoom(zoom);

    console.log(`\nZoom ${zoom}: ${tiles.length} tiles (x ${range.minX}-${range.maxX}, y ${range.minY}-${range.maxY})`);

    let downloaded = 0;
    let skipped = 0;
    let missing = 0;
    let bytes = 0;

    for (const tile of tiles) {
        const result = await downloadTile(tile);

        bytes += result.bytes;
        if (result.downloaded) downloaded++;
        if (result.skipped) skipped++;
        if (result.missing) missing++;

        if (bytesAlreadyUsed + bytes > MAX_TOTAL_BYTES) {
            console.log(`  Budget of ${formatMegabytes(MAX_TOTAL_BYTES)} exceeded partway through zoom ${zoom}`);
            return { bytes: bytes, downloaded: downloaded, skipped: skipped, missing: missing, overBudget: true };
        }
    }

    console.log(`  Downloaded ${downloaded}, skipped ${skipped}, missing ${missing}, ${formatMegabytes(bytes)}`);

    return { bytes: bytes, downloaded: downloaded, skipped: skipped, missing: missing, overBudget: false };
}

async function dropZoom(zoom) {
    console.log(`  Dropping zoom ${zoom} to stay under the size budget`);
    await fs.promises.rm(path.join(OUTPUT_DIR, String(zoom)), { recursive: true, force: true });
}

(async () => {
    console.log('Downloading Stamen Watercolor tiles for central Helsinki');
    console.log(`Bounds: lat ${BOUNDS.minLat}-${BOUNDS.maxLat}, lon ${BOUNDS.minLon}-${BOUNDS.maxLon}`);
    console.log(`Output: ${OUTPUT_DIR}`);

    let totalBytes = 0;

    // Lowest zoom first, so that if the budget runs out it is the highest zoom that gets dropped.
    for (let zoom = MIN_ZOOM; zoom <= MAX_ZOOM; zoom++) {
        const result = await downloadZoom(zoom, totalBytes);

        if (result.overBudget) {
            await dropZoom(zoom);
            break;
        }

        totalBytes += result.bytes;
    }

    console.log(`\nDone. Total on disk: ${formatMegabytes(totalBytes)}`);
})();
