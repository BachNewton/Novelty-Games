import musicPlayerIndexJson from './music-player-index.json';

export interface Song {
    ids: TrackIds;
    metadata: SongMetadata;
}

export interface SongMetadata {
    title: string;
    artist: string;
}

export interface TrackIds {
    guitar: string | null;
    bass: string | null;
    vocals: string | null;
    drums: string | null;
    drums1: string | null;
    drums2: string | null;
    drums3: string | null;
    keys: string | null;
    backing: string;
}

export function getMusicPlayerSongs(): Song[] {
    return musicPlayerIndexJson.map(song => {
        return {
            ids: {
                guitar: song?.['guitar.ogg'] ?? null,
                bass: song?.['rhythm.ogg'] ?? null,
                vocals: song?.['vocals.ogg'] ?? null,
                drums: song?.['drums.ogg'] ?? null,
                drums1: song?.['drums_1.ogg'] ?? null,
                drums2: song?.['drums_2.ogg'] ?? null,
                drums3: song?.['drums_3.ogg'] ?? null,
                keys: song?.['keys.ogg'] ?? null,
                backing: song['song.ogg']
            },
            metadata: {
                title: song.meta.title,
                artist: song.meta.artist
            }
        };
    });
}
