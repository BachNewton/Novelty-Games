import { Question, Rollercoaster } from "./Data";
import createQuestion from "./QuestionCreator";

export default function createQuestions(coasters: Array<Rollercoaster>): Array<Question> {
    const copiedCoasters = [...coasters];
    const shuffledCoasters = [];
    while (copiedCoasters.length > 0) {
        const randomIndex = Math.floor(Math.random() * copiedCoasters.length);
        shuffledCoasters.push(copiedCoasters.splice(randomIndex, 1)[0]);
    }

    return shuffledCoasters.map((coaster) => createQuestion(coasters, coaster));
}
