import { DataType, Rollercoaster, Data, Song, PokemonAll, Pokemon, Flag } from "./Data";
import { get as getFromDb, store as storeInDb } from "./Database";
import { get as getFromNetwork } from "./Networking";
import { ProgressEmitter } from "./ProgressUpdater";

export function get(
    dataType: DataType,
    progressEmitter: ProgressEmitter,
    urls?: Array<string>
): Promise<Array<Data>> {
    return getFromDb(dataType, progressEmitter).then(jsons => {
        console.log('Found in Database', dataType, jsons);

        return handleJsons(dataType, jsons, progressEmitter);
    }).catch(_ => {
        console.log('No data in Database', dataType);

        return getFromNetwork(dataType, progressEmitter, urls).then(jsons => {
            console.log('From Network', dataType, jsons);

            storeInDb(dataType, jsons);

            return handleJsons(dataType, jsons, progressEmitter);
        });
    });
}

async function handleJsons(dataType: DataType, jsons: Array<any>, progressEmitter: ProgressEmitter): Promise<Array<Data>> {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            return handleRollercoastersJson(jsons[0]);
        case DataType.MUSIC:
            return handleSongsJson(jsons[0]);
        case DataType.FLAG_GAME:
            return handleFlagGameJson(jsons[0]);
        case DataType.POKEMON_ALL:
            return await handlePokemonAllJson(jsons[0], progressEmitter);
        case DataType.POKEMON:
            return handlePokemonJsons(jsons);
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function handleRollercoastersJson(json: any): Array<Rollercoaster> {
    const rollercoasters = cleanData(json);
    console.log('All Rollercoasters', rollercoasters);

    const filteredRollercoasters = filterCoasters(rollercoasters);
    console.log('Filtered Rollercoasters', filteredRollercoasters);

    return filteredRollercoasters;
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

function handleSongsJson(json: any): Array<Song> {
    const songs = json as Array<Song>;
    console.log('All Songs', songs);

    songs.forEach(song => song.imageUrl = getSongImageUrl(song.SongID));

    return songs;
}

function getSongImageUrl(songId: string): string {
    return 'https://cdn.rb4.app/art/' + songId + '.png';
}

async function handlePokemonAllJson(json: any, progressEmitter: ProgressEmitter): Promise<Array<Pokemon>> {
    const pokemonAll = json as PokemonAll;

    const urls = pokemonAll.results.map(pokemonEntry => pokemonEntry.url);
    return await get(DataType.POKEMON, progressEmitter, urls) as Array<Pokemon>;
}

function handleFlagGameJson(json: any): Array<Flag> {
    return Object.keys(json).map(id => { return { name: json[id], imageUrl: getFlagImageUrl(id) } });
}

function getFlagImageUrl(id: string): string {
    return `https://flagcdn.com/${id}.svg`;
}

function handlePokemonJsons(jsons: Array<any>): Array<Pokemon> {
    const pokemon = jsons as Array<Pokemon>;
    console.log('All Pokemon', pokemon);

    const filteredPokemon = pokemon.filter(it => it.sprites.other["official-artwork"].front_default !== null);
    console.log('Filtered Pokemon', filteredPokemon);

    filteredPokemon.forEach(it => {
        it.formattedName = toCapitalizedSeparatedWords(it.species.name);
    });

    return filteredPokemon;
}

function toCapitalizedSeparatedWords(str: string): string {
    return (str[0].toUpperCase() + str.slice(1)).replace(/-([a-zA-Z])/g, (_, followingChar) => ` ${followingChar.toUpperCase()}`);
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
