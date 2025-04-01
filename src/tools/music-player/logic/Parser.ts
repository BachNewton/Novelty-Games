export interface SongPackage {
    folderName: string;
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
        const folderName = path[path.length - 2];
        songFiles.get(folderName)?.push(file) ?? songFiles.set(folderName, [file]);
    }

    const songPackages: SongPackage[] = [];

    songFiles.forEach((files, folderName) => {
        const songPackage = createSongPackage(files, folderName);

        if (songPackage === null) return;

        songPackages.push(songPackage);
    });

    return songPackages;
}

function createSongPackage(files: File[], folderName: string): SongPackage | null {
    const iniFile = files.find(file => file.name === 'song.ini');
    const guitarFile = files.find(file => file.name === 'guitar.ogg');
    const bassFile = files.find(file => file.name === 'rhythm.ogg');
    const vocalsFile = files.find(file => file.name === 'vocals.ogg');
    const drums1File = files.find(file => file.name === 'drums_1.ogg');
    const drums2File = files.find(file => file.name === 'drums_2.ogg');
    const drums3File = files.find(file => file.name === 'drums_3.ogg');
    const backingFile = files.find(file => file.name === 'song.ogg');

    if (iniFile === undefined) console.error('No song.ini found in ' + folderName);
    if (guitarFile === undefined) console.error('No guitar.ogg found in ' + folderName);
    if (bassFile === undefined) console.error('No rhythm.ogg found in ' + folderName);
    if (vocalsFile === undefined) console.error('No vocals.ogg found in ' + folderName);
    if (drums1File === undefined) console.error('No drums_1.ogg found in ' + folderName);
    if (drums2File === undefined) console.error('No drums_2.ogg found in ' + folderName);
    if (drums3File === undefined) console.error('No drums_3.ogg found in ' + folderName);
    if (backingFile === undefined) console.error('No song.ogg found in ' + folderName);

    if (iniFile === undefined || guitarFile === undefined || bassFile === undefined ||
        vocalsFile === undefined || drums1File === undefined || drums2File === undefined ||
        drums3File === undefined || backingFile === undefined) return null;

    return {
        folderName: folderName,
        ini: iniFile,
        guitar: guitarFile,
        bass: bassFile,
        vocals: vocalsFile,
        drums1: drums1File,
        drums2: drums2File,
        drums3: drums3File,
        backing: backingFile
    };
}

export function fileToAudio(file: File): Promise<HTMLAudioElement> {
    return new Promise(resolve => {
        const audio = new Audio(URL.createObjectURL(file));
        audio.addEventListener('canplaythrough', () => resolve(audio));
    });
}
