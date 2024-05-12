import { Question } from "./Data";
import fecthData from "./Networking";
import createQuestion from "./QuestionCreator";

export default function createGame(): Promise<Array<Question>> {
    return fecthData().then(coasters => {
        const copiedCoasters = [...coasters];
        const shuffledCoasters = [];
        while (copiedCoasters.length > 0) {
            const randomIndex = Math.floor(Math.random() * copiedCoasters.length);
            shuffledCoasters.push(copiedCoasters.splice(randomIndex, 1)[0]);
        }

        return shuffledCoasters.map((coaster) => createQuestion(coasters, coaster));
    });
}
