import { DownloadFileResponse, NetworkService } from "../../../util/networking/NetworkService";
import { Song, SongMetadata, TrackIds } from "../data/MusicPlayerIndex";

type TrackPromises = { [Id in keyof TrackIds]: Promise<HTMLAudioElement> | null };

interface ParsedSong {
    metadata: SongMetadata;
    trackPromises: TrackPromises;
}

interface ParserProgress {
    current: number;
    total: number;
}

export interface SongParser {
    parse(song: Song, onParserProgress: (progress: ParserProgress) => void): ParsedSong;
}

export function createSongParser(networkService: NetworkService<void>): SongParser {
    const createResponse = (id: string | null) => id === null ? null : networkService.downloadFile({ id: id });

    return {
        parse: (song, onParserProgress) => {
            const trackPromises: TrackPromises = {
                guitar: createTrack('guitar', createResponse(song.ids.guitar)),
                bass: createTrack('bass', createResponse(song.ids.bass)),
                vocals: createTrack('vocals', createResponse(song.ids.vocals))
            };

            const nonNullTrackPromises = Object.values(trackPromises).filter(trackPromise => trackPromise !== null) as Promise<HTMLAudioElement>[];

            const progress: ParserProgress = {
                current: 0,
                total: nonNullTrackPromises.length
            };

            onParserProgress(progress);

            nonNullTrackPromises.forEach(trackPromise => trackPromise.then(() => {
                progress.current = progress.current + 1;
                onParserProgress(progress);
            }))

            return {
                metadata: song.metadata,
                trackPromises: trackPromises
            };
        }
    };
}

function createTrack(track: keyof TrackIds, responsePromise: Promise<DownloadFileResponse> | null): Promise<HTMLAudioElement> | null {
    if (responsePromise === null) {
        console.log('No ID found for:', track);
        return null;
    }

    return createTrackAsync(track, responsePromise);
}

async function createTrackAsync(track: keyof TrackIds, responsePromise: Promise<DownloadFileResponse>): Promise<HTMLAudioElement> {
    console.log('Downloading:', track);
    const response = await responsePromise;
    console.log('Downloaded:', track);

    const blob = new Blob([response.buffer]);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    return audio;
}
