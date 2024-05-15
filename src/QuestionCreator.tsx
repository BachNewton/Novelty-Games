import { Question, Rollercoaster } from './Data';

export default function createQuestion(coasters: Array<Rollercoaster>, coasterAnswer: Rollercoaster): Question {
    const allParks = new Set([...coasters.map(coaster => coaster.park.name)]);

    const incorrectOptions = getOptions(3, allParks, coasterAnswer.park.name)

    const text = `Which park is the coaster "${coasterAnswer.name}" made by "${coasterAnswer.make}" from?`;
    const correctIndex = Math.floor(Math.random() * 4);
    const options = incorrectOptions.slice(0, correctIndex).concat(coasterAnswer.park.name).concat(incorrectOptions.slice(correctIndex));

    return { text: text, options: options, correctIndex: correctIndex } as Question;
}

function getOptions(numberOfOptions: number, allOptions: Set<string>, isNot: string): Array<string> {
    const remainingOptions = [] as Array<string>;
    allOptions.delete(isNot);
    allOptions.forEach(value => {
        remainingOptions.push(value);
    });

    const options = [] as Array<string>;
    while (options.length < numberOfOptions) {
        const randomIndex = Math.floor(Math.random() * remainingOptions.length);
        options.push(remainingOptions.splice(randomIndex, 1)[0]);
    }

    return options;
}
