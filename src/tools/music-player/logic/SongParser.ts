import { DownloadFileResponse, NetworkService } from "../../../util/networking/NetworkService";
import { wait } from "../../../util/Wait";
import { Song, SongMetadata, TrackIds } from "../data/MusicPlayerIndex";

type TrackPromises = { [Id in keyof TrackIds]: Promise<HTMLAudioElement> | null };

interface ParsedSong {
    metadata: SongMetadata;
    trackPromises: TrackPromises;
}

export interface ParserProgress {
    current: number;
    total: number;
}

export interface SongParser {
    parse(song: Song, onParserProgress: (progress: ParserProgress | null) => void): ParsedSong;
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

            const total = nonNullTrackPromises.length;
            let current = 0;

            onParserProgress({
                total: total,
                current: current
            });

            nonNullTrackPromises.forEach(trackPromise => trackPromise.then(async () => {
                current++;

                onParserProgress({
                    total: total,
                    current: current
                });

                await wait(1750);

                onParserProgress(null);
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
