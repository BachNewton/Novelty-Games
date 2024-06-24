import { SafetyCard } from "./Card";
import { Game, Team } from "./Data";
import { getTotalDistance } from "./Rules";

interface Score {
    distance: number;
    eachSafety: number;
    allSafeties: number;
    coupFourré: number;
    tripCompleted: number;
    deplayedAction: number;
    safeTrip: number;
    extention: number;
    shutout: number;
}

export function calculateScore(game: Game): Map<Team, Score> {
    for (const team of game.teams) {
        const distance = 1 * getTotalDistance(team.tableau.distanceArea);
        const eachSafety = 100 * team.tableau.safetyArea.length;
        const allSafeties = team.tableau.safetyArea.length === 4 ? 300 : 0;
        const coupFourré = team.tableau.safetyArea.reduce((points: number, safetyCard: SafetyCard) => points + (safetyCard.coupFourré ? 300 : 0), 0);
    }
    return new Map();
}
