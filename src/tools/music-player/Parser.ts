interface SongFile {
    path: string;
    file: File;
}

export function selectFolder() {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;

    input.addEventListener('change', () => {
        const files = Array.from(input.files ?? []);

        const songFiles = files.map<SongFile>(file => {
            return {
                path: file.webkitRelativePath,
                file: file
            };
        });

        parseSongsFiles(songFiles);
    });

    input.click();
}

export function parseSongsFiles(trackFiles: SongFile[]) {
    console.log('Selected files:', trackFiles);

    const firstAudioTrack = trackFiles.find(trackFile => trackFile.path.endsWith('.ogg'));
    if (firstAudioTrack === undefined) return;
    const audioSrc = URL.createObjectURL(firstAudioTrack.file);

    console.log('Playing:', firstAudioTrack.path);
    new Audio(audioSrc).play();
}
