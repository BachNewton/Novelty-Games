export interface Data { }

export interface Rollercoaster extends Data {
    name: string;
    make: string;
    model: string;
    status: Status;
    park: Park;
    country: string;
    mainPicture: MainPicture;
}

interface Status {
    state: string;
    date: Date;
}

interface Date {
    opened: string;
}

interface Park {
    name: string;
}

interface MainPicture {
    url: string;
}

export interface Song extends Data {
    Name: string;
    Artist: string;
    Year: number;
    SongID: string;
    imageUrl: string;
}

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

export interface Question {
    text: string;
    options: Array<string>;
    correctIndex: number;
    imageUrl: string;
}

export enum DataType {
    ROLLERCOASTERS = 'ROLLERCOASTERS',
    MUSIC = 'MUSIC',
    POKEMON = 'POKEMON',
    POKEMON_ALL = 'POKEMON_ALL'
}
