import { Song } from "../data/Song";
import musicPlayerIndexJson from '../data/music-player-index.json';

export interface MusicIndex {
    songs: Song[];
    genres: Set<string>;
}

export function createMusicIndex(): MusicIndex {
    const songs = musicPlayerIndexJson.map<Song>(song => {
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
                title: song.meta.name,
                artist: song.meta.artist,
                genre: song.meta.genre,
                year: Number(song.meta.year)
            }
        };
    });

    const genres = new Set(songs.map(song => song.metadata.genre));

    return {
        songs: songs,
        genres: genres
    };
}
