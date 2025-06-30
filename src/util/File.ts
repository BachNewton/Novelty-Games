export enum FileType {
    TEXT = 'text/plain',
    JSON = 'application/json'
}

export function createFile(type: FileType, fileName: string, content: string) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
}
