export interface PokemonAll {
    results: Array<PokemonEntry>;
}

interface PokemonEntry {
    url: string;
}

export interface Pokemon {
    species: Species;
    sprites: Sprites;
    formattedName: string;
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
