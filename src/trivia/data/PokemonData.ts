import { Data } from "./Data";

export interface PokemonAll {
    results: Array<PokemonEntry>;
}

interface PokemonEntry {
    url: string;
}

export interface NetworkPokemon {
    species: Species;
    sprites: Sprites;
    stats: Array<NetworkStats>;
    types: Array<NetworkTypes>;
}

interface NetworkTypes {
    type: NetworkType;
}

interface NetworkType {
    name: string;
}

interface Species {
    name: string;
}

interface Sprites {
    other: OtherSprites;
}

interface OtherSprites {
    'official-artwork': OfficalArtwork;
}

interface OfficalArtwork {
    front_default: string;
}

interface NetworkStats {
    base_stat: number;
    stat: Stat;
}

interface Stat {
    name: string;
}

export interface Pokemon extends Data {
    name: string;
    imageUrl: string;
    stats: Stats;
    typing: PokemonTyping;
}

interface Stats {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
}

interface PokemonTyping {
    primary: PokemonType;
    secondary: PokemonType | null;
}

export enum PokemonType {
    NORMAL = 'normal',
    FIRE = 'fire',
    WATER = 'water',
    GRASS = 'grass',
    ELECTRIC = 'electric',
    ICE = 'ice',
    FIGHTING = 'fighting',
    POISON = 'poison',
    GROUND = 'ground',
    FLYING = 'flying',
    PSYCHIC = 'psychic',
    BUG = 'bug',
    ROCK = 'rock',
    GHOST = 'ghost',
    DRAGON = 'dragon',
    DARK = 'dark',
    STEEL = 'steel',
    FAIRY = 'fairy',
}
