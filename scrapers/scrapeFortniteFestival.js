import fs from 'fs';

// Epic's own content API for Festival jam tracks. This is the upstream source the
// community sites repackage, so it needs no HTML scraping and exposes fields those
// sites drop - notably `_activeDate`, the date a track first hit the in-game store.
const SPARK_TRACKS_URL = 'https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game/spark-tracks';
const OUTPUT_PATH = 'db/fortniteFestivalSongs.json';

// Epic writes 99 into an intensity when the part has no rating rather than omitting it.
const UNRATED_INTENSITY = 99;

(async () => {
    console.log('Fetching:', SPARK_TRACKS_URL);
    const response = await fetch(SPARK_TRACKS_URL);

    if (!response.ok) {
        throw new Error(`Failed to fetch spark tracks: ${response.status} ${response.statusText}`);
    }

    const content = await response.json();

    // The response mixes CMS metadata (_title, _locale, lastModified, ...) in alongside
    // the track entries, so keep only the entries that actually carry a track.
    const trackEntries = Object.values(content).filter(entry => entry?.track);
    console.log('Found tracks:', trackEntries.length);

    if (trackEntries.length === 0) {
        throw new Error('No tracks found - the spark tracks response shape has likely changed');
    }

    const songs = trackEntries.map(entry => {
        const track = entry.track;
        const intensities = track.in ?? {};

        console.log('Processing song:', track.tt, 'by', track.an);

        return {
            name: track.tt,
            artist: track.an,
            albumArt: track.au,
            year: track.ry,
            length: track.dn,
            storeReleaseDate: entry._activeDate ?? null,
            sampleMp3: null,
            difficulties: {
                bass: toDifficulty(intensities.ba),
                drums: toDifficulty(intensities.ds),
                guitar: toDifficulty(intensities.gr),
                proBass: toDifficulty(intensities.pb),
                proDrums: toDifficulty(intensities.pd),
                proGuitar: toDifficulty(intensities.pg),
                vocals: toDifficulty(intensities.vl)
            }
        };
    });

    // Sorted by name so the weekly commit only diffs tracks that actually changed.
    songs.sort((a, b) => a.name.localeCompare(b.name));

    console.log('Songs:', songs.length);

    console.log('Writing songs to JSON file');
    await fs.promises.writeFile(OUTPUT_PATH, JSON.stringify(songs));
})();

// A part with no chart is absent from the intensities entirely, so normalize both that
// and the 99 placeholder to null.
function toDifficulty(intensity) {
    return intensity === undefined || intensity === UNRATED_INTENSITY ? null : intensity;
}
