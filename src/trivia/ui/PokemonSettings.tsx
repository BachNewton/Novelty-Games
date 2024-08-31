import { useState } from "react";

const POKEMON_QUESTION_TYPE_SECTION_KEY = 'POKEMON_QUESTION_TYPE_SECTION_KEY';

interface PokemonSettingsProps {
    questionTypeGetter: PokemonSettingsQuestionTypeGetter;
}

const PokemonSettings: React.FC<PokemonSettingsProps> = ({ questionTypeGetter }) => {
    const [questionTypeSelection, setQuestionTypeSection] = useState(PokemonQuestionType.WHO);

    questionTypeGetter.get = () => questionTypeSelection;

    const onChange = (e: React.FormEvent<HTMLDivElement>) => {
        const value = (e.target as HTMLInputElement).value;
        setQuestionTypeSection(value === 'who' ? PokemonQuestionType.WHO : PokemonQuestionType.STAT);
    };

    return <div>
        <h1>Pokémon Settings</h1>
        <h3>Select which question type you'd like to use</h3>
        <div onChange={onChange}>
            <input type="radio" value="who" name="questionType" /> Who's that Pokémon?!
            <br />
            <input type="radio" value="stat" name="questionType" /> Which of these Pokémon has the highest stat?
        </div>
    </div>;
};

export enum PokemonQuestionType {
    WHO = 'WHO', STAT = 'STAT'
}

export interface PokemonSettingsQuestionTypeGetter {
    get: (() => PokemonQuestionType) | null;
}

export function savePokemonQuestionTypeSelection(questionType: PokemonQuestionType) {
    localStorage.setItem(POKEMON_QUESTION_TYPE_SECTION_KEY, JSON.stringify(questionType));
}

export function getPokemonQuestionTypeSelection(): PokemonQuestionType {
    const storedValue = localStorage.getItem(POKEMON_QUESTION_TYPE_SECTION_KEY);

    if (storedValue === null) return PokemonQuestionType.WHO;

    return JSON.parse(storedValue) as PokemonQuestionType;
}

export default PokemonSettings;
