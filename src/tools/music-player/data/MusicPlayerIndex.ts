import musicPlayerIndexJson from './music-player-index.json';

export interface MusicPlayerIndexSong {
    guitar?: string;
    bass?: string;
    metadata: MusicPlayerIndexSongMetadata;
}

interface MusicPlayerIndexSongMetadata {
    title: string;
    artist: string;
}

export function getMusicPlayerIndex(): MusicPlayerIndexSong[] {
    return musicPlayerIndexJson.map(song => {
        return {
            guitar: song?.['guitar.ogg'],
            bass: song?.['rhythm.ogg'],
            metadata: {
                title: song?.meta.title ?? '(Unknown)',
                artist: song?.meta.artist ?? '(Unknown)'
            }
        };
    });
}
