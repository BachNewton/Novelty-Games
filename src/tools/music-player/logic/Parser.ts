export interface SongPackage {
    id: string;
    ini: File,
    guitar: File,
    bass: File,
    vocals: File,
    drums1: File,
    drums2: File,
    drums3: File,
    backing: File
}

export function selectFolder(): Promise<SongPackage[]> {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;

    return new Promise(resolve => {
        input.addEventListener('change', () => {
            const files = Array.from(input.files ?? []);

            resolve(createSongPackages(files));
        });

        input.click();
    });
}

function createSongPackages(files: File[]): SongPackage[] {
    const songFiles = new Map<string, File[]>();

    for (const file of files) {
        const path = file.webkitRelativePath.split('/');
        const name = path[path.length - 2];
        songFiles.get(name)?.push(file) ?? songFiles.set(name, [file]);
    }

    const songPackages: SongPackage[] = [];

    songFiles.forEach((files, name) => {
        songPackages.push({
            id: name,
            ini: files.find(file => file.name === 'song.ini')!,
            guitar: files.find(file => file.name === 'guitar.ogg')!,
            bass: files.find(file => file.name === 'bass.ogg')!,
            vocals: files.find(file => file.name === 'vocals.ogg')!,
            drums1: files.find(file => file.name === 'drums1.ogg')!,
            drums2: files.find(file => file.name === 'drums2.ogg')!,
            drums3: files.find(file => file.name === 'drums3.ogg')!,
            backing: files.find(file => file.name === 'backing.ogg')!
        });
    });

    return songPackages;
}

// export function parseSongsFiles(trackFiles: SongFile[]) {
//     console.log('Selected files:', trackFiles);

//     const firstAudioTrack = trackFiles.find(trackFile => trackFile.path.endsWith('.ogg'));
//     if (firstAudioTrack === undefined) return;
//     const audioSrc = URL.createObjectURL(firstAudioTrack.file);

//     console.log('Playing:', firstAudioTrack.path);
//     new Audio(audioSrc).play();
// }

// export async function getNameAndArtist(file: File): Promise<string> {
//     const text = await file.text();
//     const lines = text.split('\n');
//     const nameLine = lines.find(line => line.startsWith('name = '));
//     const artistLine = lines.find(line => line.startsWith('artist = '));
//     const name = nameLine ? nameLine.split('=')[1].trim() : 'Unknown Name';
//     const artist = artistLine ? artistLine.split('=')[1].trim() : 'Unknown Artist';
//     return `${name} - ${artist}`;
// }
