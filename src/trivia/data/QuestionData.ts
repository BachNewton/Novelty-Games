import Question from "../ui/Question";

export interface Question {
    text: string;
    options: Array<string>;
    correctIndex: number;
}

class QuestionImpl implements Question {
    text: string;
    options: string[];
    correctIndex: number;

    constructor(text: string, options: string[], correctIndex: number) {
        this.text = text;
        this.options = options;
        this.correctIndex = correctIndex;
    }
}

export class MultiImageQuestion extends QuestionImpl {
    constructor(text: string, options: string[], correctIndex: number) {
        super(text, options, correctIndex);
    }
}

export class ImageQuestion extends QuestionImpl {
    imageUrl: string;

    constructor(text: string, options: string[], correctIndex: number, imageUrl: string) {
        super(text, options, correctIndex);

        this.imageUrl = imageUrl;
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
