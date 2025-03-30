export interface SongFile {
    path: string;
    file: File;
}

export function selectFolder(): Promise<SongFile[]> {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;

    return new Promise(resolve => {
        input.addEventListener('change', () => {
            const files = Array.from(input.files ?? []);

            const songFiles = files.map<SongFile>(file => {
                return {
                    path: file.webkitRelativePath,
                    file: file
                };
            });

            // parseSongsFiles(songFiles);
            resolve(songFiles);
        });

        input.click();
    });
}

export function parseSongsFiles(trackFiles: SongFile[]) {
    console.log('Selected files:', trackFiles);

    const firstAudioTrack = trackFiles.find(trackFile => trackFile.path.endsWith('.ogg'));
    if (firstAudioTrack === undefined) return;
    const audioSrc = URL.createObjectURL(firstAudioTrack.file);

    console.log('Playing:', firstAudioTrack.path);
    new Audio(audioSrc).play();
}

export async function getNameAndArtist(file: File): Promise<string> {
    const text = await file.text();
    const lines = text.split('\n');
    const nameLine = lines.find(line => line.startsWith('name = '));
    const artistLine = lines.find(line => line.startsWith('artist = '));
    const name = nameLine ? nameLine.split('=')[1].trim() : 'Unknown Name';
    const artist = artistLine ? artistLine.split('=')[1].trim() : 'Unknown Artist';
    return `${name} - ${artist}`;
}
