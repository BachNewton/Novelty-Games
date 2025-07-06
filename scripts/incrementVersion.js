import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const VERSIONING_FILE_PATH = '../src/Versioning.ts';
const VERSIONING_REGEX = /APP_VERSION = '((\d+)\.(\d+)\.(\d+))'/;

export function incrementVersion(type) {
    console.log(`Incrementing version type: ${type}`);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filePath = path.join(__dirname, VERSIONING_FILE_PATH);

    const data = fs.readFileSync(filePath).toString();

    const match = data.match(VERSIONING_REGEX);

    const version = match[1];
    const major = match[2];
    const minor = match[3];
    const patch = match[4];

    console.log(`Current version: ${version}`);
    const newVersion = getNewVersion(type, major, minor, patch);
    console.log(`New version: ${newVersion}`);

    const updatedData = data.replace(version, newVersion);

    fs.writeFileSync(filePath, updatedData);

    console.log('Done');
}

function getNewVersion(type, major, minor, patch) {
    if (type === 'major') {
        return `${parseInt(major) + 1}.0.0`;
    } else if (type === 'minor') {
        return `${major}.${parseInt(minor) + 1}.0`;
    } else if (type === 'patch') {
        return `${major}.${minor}.${parseInt(patch) + 1}`;
    } else {
        throw new Error('Invalid version type. Use "major", "minor", or "patch".');
    }
}
