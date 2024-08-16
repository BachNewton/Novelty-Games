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
}

interface Stats {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
}
