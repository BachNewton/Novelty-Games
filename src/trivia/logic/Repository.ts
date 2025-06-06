import { DataType, Rollercoaster, Data, Song, Flag, FestivalSong, Airplane } from "../data/Data";
import { NetworkPokemon, Pokemon, PokemonAll, PokemonType } from "../data/PokemonData";
import { get as getFromDb, store as storeInDb } from "./Database";
import { AIRPLANES_URL, get as getFromNetwork } from "./Networking";
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
        case DataType.AIRPLANES_ALL:
            return await handleAirplanesAllJson(jsons[0], progressEmitter);
        case DataType.AIRPLANES:
            return handleAirplanesJsons(jsons);
        case DataType.FORTNITE_FESTIVAL:
            return handleFestivalJson(jsons[0]);
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function handleRollercoastersJson(json: any): Array<Rollercoaster> {
    const rollercoasters = cleanData(json);

    console.log('All Rollercoasters', rollercoasters);

    return rollercoasters;
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

        coaster.country = coaster.country === '' ? 'Unknown' : coaster.country;

        coaster.model = coaster.model === '' ? 'Unknown' : coaster.model;
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

async function handleAirplanesAllJson(json: any, progressEmitter: ProgressEmitter): Promise<Array<Airplane>> {
    const airplanesAll = json as Array<string>;

    const urls = airplanesAll.map(airplane => AIRPLANES_URL + airplane);
    return await get(DataType.AIRPLANES, progressEmitter, urls) as Array<Airplane>;
}

function handleFlagGameJson(json: any): Array<Flag> {
    const flags = Object.keys(json).map(id => { return { name: json[id], imageUrl: getFlagImageUrl(id), isUsState: isUsStateFlag(id) } });
    console.log('All Flags:', flags);

    const filteredFlags = flags.filter(flag => !flag.isUsState);
    console.log('Filtered Flags:', filteredFlags);

    return filteredFlags;
}

function getFlagImageUrl(id: string): string {
    return `https://flagcdn.com/${id}.svg`;
}

function isUsStateFlag(id: string) {
    return id.includes('us-');
}

function handlePokemonJsons(jsons: Array<any>): Array<Pokemon> {
    const networkPokemon = jsons as Array<NetworkPokemon>;
    console.log('All Network Pokemon', networkPokemon);

    const filteredNetworkPokemon = networkPokemon.filter(it => it.sprites.other["official-artwork"].front_default !== null);
    console.log('Filtered Network Pokemon', filteredNetworkPokemon);

    const pokemon: Array<Pokemon> = filteredNetworkPokemon.map(it => {
        return {
            name: toCapitalizedSeparatedWords(it.species.name),
            imageUrl: it.sprites.other["official-artwork"].front_default,
            stats: {
                hp: it.stats.find(stat => stat.stat.name === 'hp')!.base_stat,
                attack: it.stats.find(stat => stat.stat.name === 'attack')!.base_stat,
                defense: it.stats.find(stat => stat.stat.name === 'defense')!.base_stat,
                specialAttack: it.stats.find(stat => stat.stat.name === 'special-attack')!.base_stat,
                specialDefense: it.stats.find(stat => stat.stat.name === 'special-defense')!.base_stat,
                speed: it.stats.find(stat => stat.stat.name === 'speed')!.base_stat
            },
            typing: {
                primary: it.types[0].type.name as PokemonType,
                secondary: it.types[1]?.type?.name as PokemonType || null
            }
        };
    });
    console.log('Pokemon:', pokemon);

    return pokemon;
}

function toCapitalizedSeparatedWords(str: string): string {
    return (str[0].toUpperCase() + str.slice(1)).replace(/-([a-zA-Z])/g, (_, followingChar) => ` ${followingChar.toUpperCase()}`);
}

function handleAirplanesJsons(jsons: Array<any>): Array<Airplane> {
    const airplanes = (jsons as Array<Array<Airplane>>).flat();
    airplanes.forEach(airplane => airplane.name = airplane.make + ' - ' + airplane.model);
    console.log('All Airplanes', airplanes);

    return airplanes;
}

function handleFestivalJson(json: any): Array<FestivalSong> {
    const festivalSongs = json as Array<FestivalSong>;

    festivalSongs.forEach(song => song.artist = song.artist.replace('&amp;', '&'));
    console.log('Festival Songs', festivalSongs);

    return festivalSongs;
}
