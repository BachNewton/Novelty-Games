import { Pokemon, PokemonType, PokemonTyping } from "./PokemonData";

export interface Question {
    text: string;
    correctIndex: number;
}

class QuestionImpl implements Question {
    text: string;
    correctIndex: number;

    constructor(text: string, correctIndex: number) {
        this.text = text;
        this.correctIndex = correctIndex;
    }
}

export class PokemonMultiImageQuestion extends QuestionImpl {
    options: Array<Pokemon>;
    optionStatGetters: Array<() => number>;

    constructor(text: string, options: Array<Pokemon>, correctIndex: number, optionStatGetters: Array<() => number>) {
        super(text, correctIndex);

        this.options = options;
        this.optionStatGetters = optionStatGetters;
    }
}

export class ImageQuestion extends QuestionImpl {
    imageUrl: string;
    options: Array<string>;

    constructor(text: string, options: string[], correctIndex: number, imageUrl: string) {
        super(text, correctIndex);

        this.imageUrl = imageUrl;
        this.options = options;
    }
}

export class PokemonTypeQuestion extends ImageQuestion {
    attackingType: PokemonType;
    defendingTyping: PokemonTyping;

    constructor(text: string, options: string[], correctIndex: number, imageUrl: string, attackingType: PokemonType, defendingTyping: PokemonTyping) {
        super(text, options, correctIndex, imageUrl);

        this.attackingType = attackingType;
        this.defendingTyping = defendingTyping;
    }
}

export class FortniteFestivalQuestion extends ImageQuestion {
    audioLink: string;

    constructor(text: string, options: string[], correctIndex: number, imageUrl: string, audioLink: string) {
        super(text, options, correctIndex, imageUrl);

        this.audioLink = audioLink;
    }
}

export class MusicQuestion extends ImageQuestion {
    spotifyId: string;

    constructor(text: string, options: string[], correctIndex: number, imageUrl: string, spotifyId: string) {
        super(text, options, correctIndex, imageUrl);

        this.spotifyId = spotifyId;
    }
}
