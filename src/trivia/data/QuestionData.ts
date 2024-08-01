export interface Question {
    text: string;
    options: Array<string>;
    correctIndex: number;
    imageUrl: string;
    spotifyId: string | null;
    audioLink: string | null;
}
