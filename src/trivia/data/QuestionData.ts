import Question from "../ui/Question";
import { Pokemon } from "./PokemonData";

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

    constructor(text: string, options: Array<Pokemon>, correctIndex: number) {
        super(text, correctIndex);

        this.options = options;
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
