import musicPlayerIndexJson from './music-player-index.json';

export interface Song {
    guitar?: string;
    bass?: string;
    metadata: SongMetadata;
}

export interface SongMetadata {
    title: string;
    artist: string;
}

export function getMusicPlayerSongs(): Song[] {
    return musicPlayerIndexJson.map(song => {
        return {
            guitar: song?.['guitar.ogg'],
            bass: song?.['rhythm.ogg'],
            metadata: {
                title: song.meta.title,
                artist: song.meta.artist
            }
        };
    });
}
