import { FestivalSong } from "../../../trivia/data/Data";
import { SelectedInstruments } from "../ui/Home";

export function calculateOverallDifficulty(
    song: FestivalSong,
    difficultyWeight: number,
    selectedInstruments: SelectedInstruments,
    selectedProInstruments: SelectedInstruments
): number {
    const guitarDifficulty = selectedProInstruments.guitar ? song.difficulties.proGuitar : song.difficulties.guitar;
    const bassDifficulty = selectedProInstruments.bass ? song.difficulties.proBass : song.difficulties.bass;
    const drumsDifficulty = selectedProInstruments.drums ? song.difficulties.proDrums : song.difficulties.drums;
    const vocalsDifficulty = song.difficulties.vocals;

    const guitar = selectedInstruments.guitar && guitarDifficulty !== null ? guitarDifficulty ** difficultyWeight : 0;
    const bass = selectedInstruments.bass ? bassDifficulty ** difficultyWeight : 0;
    const drums = selectedInstruments.drums ? drumsDifficulty ** difficultyWeight : 0;
    const vocals = selectedInstruments.vocals ? vocalsDifficulty ** difficultyWeight : 0;

    const totalInstruments =
        (selectedInstruments.guitar && song.difficulties.proGuitar !== null ? 1 : 0) +
        (selectedInstruments.bass ? 1 : 0) +
        (selectedInstruments.drums ? 1 : 0) +
        (selectedInstruments.vocals ? 1 : 0);

    const meanPow = (guitar + bass + drums + vocals) / totalInstruments;
    const overallDifficulty = Math.pow(meanPow, 1 / difficultyWeight);

    return overallDifficulty;
}
