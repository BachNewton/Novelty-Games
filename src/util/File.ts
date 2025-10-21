export enum FileType {
    TEXT,
    JSON
}

export function createFile(type: FileType, fileName: string, content: string) {
    const blob = new Blob([content], { type: getBlobType(type) });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
}

export function loadFile<T>(type: FileType): Promise<T> {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.accept = getInputType(type);

    const fileReader = new FileReader();

    input.addEventListener('change', _ => {
        if (input.files === null || input.files.length === 0) return;

        const file = input.files[0];

        fileReader.readAsText(file);
    });

    input.click();

    return new Promise((resolve, reject) => {
        fileReader.addEventListener('load', _ => {
            const result = fileReader.result;

            if (result === null) return reject();

            const content = convertContent<T>(type, result);

            console.log('Loaded from file:', content);

            resolve(content);
        });
    });
}

function getBlobType(fileType: FileType): string {
    switch (fileType) {
        case FileType.TEXT:
            return 'text/plain';
        case FileType.JSON:
            return 'application/json';
    }
}

function getInputType(fileType: FileType): string {
    switch (fileType) {
        case FileType.TEXT:
            return '.txt';
        case FileType.JSON:
            return '.json';
    }
}

function convertContent<T>(fileType: FileType, content: any): T {
    switch (fileType) {
        case FileType.TEXT:
            return content;
        case FileType.JSON:
            return JSON.parse(content);
    }
}
