import { Data, DataType, Flag } from "../trivia/data/Data";
import { Pokemon } from "../trivia/data/PokemonData";
import { PokemonMultiImageQuestion } from "../trivia/data/QuestionData";
import { createQuestions } from "../trivia/logic/QuestionCreator";

describe('createQuestions function from QuestionCreator', () => {
    it('should not include Pokemon with the same stat in a question', () => {
        const a: Pokemon = {
            name: 'A',
            imageUrl: "",
            stats: {
                hp: 0,
                attack: 0,
                defense: 0,
                specialAttack: 0,
                specialDefense: 0,
                speed: 0
            }
        };

        const b: Pokemon = {
            name: 'B',
            imageUrl: "",
            stats: {
                hp: 0,
                attack: 0,
                defense: 0,
                specialAttack: 0,
                specialDefense: 0,
                speed: 0
            }
        };

        const c: Pokemon = {
            name: 'C',
            imageUrl: "",
            stats: {
                hp: 1,
                attack: 1,
                defense: 1,
                specialAttack: 1,
                specialDefense: 1,
                speed: 1
            }
        };

        const d: Pokemon = {
            name: 'D',
            imageUrl: "",
            stats: {
                hp: 2,
                attack: 2,
                defense: 2,
                specialAttack: 2,
                specialDefense: 2,
                speed: 2
            }
        };

        const e: Pokemon = {
            name: 'E',
            imageUrl: "",
            stats: {
                hp: 3,
                attack: 3,
                defense: 3,
                specialAttack: 3,
                specialDefense: 3,
                speed: 3
            }
        };

        const questions = createQuestions([a, b, c, d, e], DataType.POKEMON);

        expect(questions.length).toBe(5);
        questions.forEach(question => {
            const q = question as PokemonMultiImageQuestion;

            if (q.options.includes(a)) {
                expect(q.options.includes(b)).toBe(false);
            }
        });
    });
});

export { };
