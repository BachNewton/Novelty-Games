import { Question } from "./Data";
import fecthData from "./Networking";
import createQuestion from "./QuestionCreator";

export default function createGame(): Promise<Question> {
    return fecthData().then(coasters => {
        return createQuestion(coasters);
    });
}
