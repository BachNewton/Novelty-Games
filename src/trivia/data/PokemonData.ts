export interface PokemonAll {
    results: Array<PokemonEntry>;
}

interface PokemonEntry {
    url: string;
}

export interface NetworkPokemon {
    species: Species;
    sprites: Sprites;
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

export interface Pokemon {
    name: string;
    imageUrl: string;
}
