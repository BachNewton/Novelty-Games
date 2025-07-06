import musicPlayerIndexJson from './music-player-index.json';

export interface Song {
    ids: SongIds;
    metadata: SongMetadata;
}

export interface SongMetadata {
    title: string;
    artist: string;
}

export interface SongIds {
    guitar: string | null;
    bass: string | null;
    vocals: string | null;
}

export function getMusicPlayerSongs(): Song[] {
    return musicPlayerIndexJson.map(song => {
        return {
            ids: {
                guitar: song?.['guitar.ogg'] ?? null,
                bass: song?.['rhythm.ogg'] ?? null,
                vocals: song?.['vocals.ogg'] ?? null
            },
            metadata: {
                title: song.meta.title,
                artist: song.meta.artist
            }
        };
    });
}
