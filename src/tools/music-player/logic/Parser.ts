import { SongPackage } from "./MusicDatabase";

interface SongMetadata {
    title: string;
    artist: string;
}

interface ParsedSongPackage extends SongPackage {
    metadata: SongMetadata;
}

export function selectFolder(): Promise<ParsedSongPackage[]> {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;

    return new Promise(resolve => {
        input.addEventListener('change', () => {
            const files = Array.from(input.files ?? []);

            resolve(createParsedSongPackages(files));
        });

        input.click();
    });
}

async function createParsedSongPackages(files: File[]): Promise<ParsedSongPackage[]> {
    const songFiles = new Map<string, File[]>();

    for (const file of files) {
        const path = file.webkitRelativePath.split('/');
        const folderName = path[path.length - 2];
        songFiles.get(folderName)?.push(file) ?? songFiles.set(folderName, [file]);
    }

    const parsedSongPackages: Promise<ParsedSongPackage | null>[] = [];

    songFiles.forEach((files, folderName) => {
        const songPackage = createParsedSongPackage(files, folderName);

        parsedSongPackages.push(songPackage);
    });

    return Promise.all(parsedSongPackages).then(songs => songs.filter(song => song !== null)) as Promise<ParsedSongPackage[]>;
}

async function createParsedSongPackage(files: File[], folderName: string): Promise<ParsedSongPackage | null> {
    const iniFile = files.find(file => file.name === 'song.ini');
    const guitarFile = files.find(file => file.name === 'guitar.ogg');
    const bassFile = files.find(file => file.name === 'rhythm.ogg');
    const vocalsFile = files.find(file => file.name === 'vocals.ogg');
    const drumsFile = files.find(file => file.name === 'drums.ogg');
    const drums1File = files.find(file => file.name === 'drums_1.ogg');
    const drums2File = files.find(file => file.name === 'drums_2.ogg');
    const drums3File = files.find(file => file.name === 'drums_3.ogg');
    const keysFile = files.find(file => file.name === 'keys.ogg');
    const backingFile = files.find(file => file.name === 'song.ogg');

    if (iniFile === undefined) console.error('No song.ini found in ' + folderName);
    if (guitarFile === undefined) console.error('No guitar.ogg found in ' + folderName);
    if (bassFile === undefined) console.error('No rhythm.ogg found in ' + folderName);
    if (vocalsFile === undefined) console.error('No vocals.ogg found in ' + folderName);
    if (backingFile === undefined) console.error('No song.ogg found in ' + folderName);

    if (iniFile === undefined || guitarFile === undefined || bassFile === undefined ||
        vocalsFile === undefined || backingFile === undefined) return null;

    return {
        metadata: await parseIniFile(iniFile),
        folderName: folderName,
        ini: iniFile,
        guitar: guitarFile,
        bass: bassFile,
        vocals: vocalsFile,
        drums: drumsFile ?? null,
        drums1: drums1File ?? null,
        drums2: drums2File ?? null,
        drums3: drums3File ?? null,
        keys: keysFile ?? null,
        backing: backingFile
    };
}

export async function parseSongPackage(songPackage: SongPackage): Promise<ParsedSongPackage> {
    return {
        metadata: await parseIniFile(songPackage.ini),
        ...songPackage
    };
}

function parseIniFile(file: File): Promise<SongMetadata> {
    return new Promise(resolve => {
        const reader = new FileReader();

        reader.onload = () => {
            const content = reader.result as string;
            const lines = content.split('\n');
            const metadata: SongMetadata = { title: '(Unkown)', artist: '(Unkown)' };

            for (const line of lines) {
                const [key, value] = line.split(' = ');
                if (key === 'name') metadata.title = value.trim();
                if (key === 'artist') metadata.artist = value.trim();
            }

            resolve(metadata);
        };

        reader.onerror = () => {
            console.error('Error reading INI file:', file.name);
            resolve({ title: '(Unkown)', artist: '(Unkown)' });
        };


        reader.readAsText(file);
    });
}

export function fileToAudio(file: File | null): Promise<HTMLAudioElement | null> {
    return new Promise(resolve => {
        if (file !== null) {
            const audio = new Audio(URL.createObjectURL(file));
            audio.addEventListener('canplaythrough', () => resolve(audio));
        } else {
            resolve(null);
        }
    });
}
