import Question from "../ui/Question";

export interface Question {
    text: string;
    options: Array<string>;
    correctIndex: number;
    imageUrl: string;
}

export class QuestionImpl implements Question {
    text: string;
    options: string[];
    correctIndex: number;
    imageUrl: string;

    constructor(text: string, options: string[], correctIndex: number, imageUrl: string) {
        this.text = text;
        this.options = options;
        this.correctIndex = correctIndex;
        this.imageUrl = imageUrl;
    }
}

export class FortniteFestivalQuestion extends QuestionImpl {
    audioLink: string;

    constructor(text: string, options: string[], correctIndex: number, imageUrl: string, audioLink: string) {
        super(text, options, correctIndex, imageUrl);

        this.audioLink = audioLink;
    }
}

export class MusicQuestion extends QuestionImpl {
    spotifyId: string;

    constructor(text: string, options: string[], correctIndex: number, imageUrl: string, spotifyId: string) {
        super(text, options, correctIndex, imageUrl);

        this.spotifyId = spotifyId;
    }
}
