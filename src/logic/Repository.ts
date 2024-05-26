import { DataType, Rollercoaster, Data, Song } from "./Data";
import { get as getFromDb, store as storeInDb } from "./Database";
import { get as getFromNetwork } from "./Networking";

export function get(dataType: DataType): Promise<Array<Data>> {
    return getFromDb(dataType).then(json => {
        console.log('Found in Database', dataType, json);

        return handleJson(dataType, json);
    }).catch(_ => {
        console.log('No data in Database', dataType);

        return getFromNetwork(dataType).then(json => {
            console.log('From Network', dataType, json);

            storeInDb(dataType, json);

            return handleJson(dataType, json);
        });
    });
}

function handleJson(dataType: DataType, json: any): Array<Data> {
    if (dataType !== DataType.ROLLERCOASTERS) {
        const songs = json as Array<Song>;
        console.log('All Songs', songs);

        songs.forEach(song => song.imageUrl = getSongImageUrl(song.SongID));

        return songs;
    } else {
        const rollercoasters = cleanData(json);
        console.log('All Rollercoasters', rollercoasters);

        const filteredRollercoasters = filterCoasters(rollercoasters);
        console.log('Filtered Rollercoasters', filteredRollercoasters);

        return filteredRollercoasters;
    }
}

function getSongImageUrl(songId: string): string {
    return 'https://cdn.rb4.app/art/' + songId + '.png';
}

function cleanData(json: any): Array<Rollercoaster> {
    const rollercoasters = json as Array<Rollercoaster>;

    rollercoasters.forEach(coaster => {
        const opened = coaster.status.date.opened;
        const index = opened.indexOf('-');
        const opendYear = index === -1 ? opened : opened.substring(0, index);
        // Only keep the year from the opened data.
        coaster.status.date.opened = opendYear === '' ? 'Unknown' : opendYear;

        coaster.make = coaster.make === '' ? 'Unknown' : coaster.make;
    });

    return rollercoasters;
}

function filterCoasters(coasters: Array<Rollercoaster>): Array<Rollercoaster> {
    const parksCoastersCount = getParksCoastersCount(coasters);

    return coasters.filter(coaster => {
        if (coaster.status.state !== 'Operating') return false;
        if (coaster.country !== 'United States') return false;
        if (['Junior Coaster', 'Kiddie Coaster', 'Family Coaster'].includes(coaster.model)) return false;
        if (coaster.make === 'Wiegand') return false;
        if (parksCoastersCount.get(coaster.park.name) === 1) return false;
        if (coaster.park.name.includes('Pizza')) return false;
        if (coaster.park.name.includes('Farm') && coaster.park.name !== "Knott's Berry Farm") return false;

        return true;
    })
}

function getParksCoastersCount(coasters: Array<Rollercoaster>): Map<string, number> {
    const parksCoastersCount = new Map<string, number>();

    for (const coaster of coasters) {
        const count = parksCoastersCount.get(coaster.park.name);
        parksCoastersCount.set(coaster.park.name, count === undefined ? 1 : count + 1);
    }

    return parksCoastersCount;
}
