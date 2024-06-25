import { Game, Team } from "../logic/Data";
import { Score, calculateScore } from "../logic/ScoreboardCalculator";
import { getTeamName } from "./Tableau";

const SCORE_TO_WIN = 5000;

interface ScoreboardProps {
    game: Game;
    onBackToLobby: () => void;
    onPlayNextRound: (game: Game, scores: Map<Team, Score>) => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ game, onBackToLobby, onPlayNextRound }) => {
    const scores = calculateScore(game);
    const sortedEntries = Array.from(scores.entries()).sort((a, b) => b[1].total - a[1].total);

    sortedEntries[0][1].tripCompleted = 500;

    const teamScoresUi = sortedEntries.map((entry, index) => {
        const team = entry[0];
        const score = entry[1];

        const ifCompletedUi = score.tripCompleted !== 0
            ? <>
                <tr>
                    <td>Trip Completed</td>
                    <td style={{ textAlign: 'right' }}>{score.tripCompleted}</td>
                </tr>
                <tr>
                    <td>Delayed Action</td>
                    <td style={{ textAlign: 'right' }}>{score.deplayedAction}</td>
                </tr>
                <tr>
                    <td>Safe Trip</td>
                    <td style={{ textAlign: 'right' }}>{score.safeTrip}</td>
                </tr>
                <tr>
                    <td>Extension</td>
                    <td style={{ textAlign: 'right' }}>{score.extention}</td>
                </tr>
                <tr>
                    <td>Shutout</td>
                    <td style={{ textAlign: 'right' }}>{score.shutout}</td>
                </tr>
            </>
            : <></>;

        return <table key={index} style={{ border: '1px solid white', width: '90%' }}>
            <tr>
                <th>#{index + 1}: {getTeamName(team)}</th>
                <th>Points</th>
            </tr>
            <tr>
                <td>Distance</td>
                <td style={{ textAlign: 'right' }}>{score.distance}</td>
            </tr>
            <tr>
                <td>Each Safety</td>
                <td style={{ textAlign: 'right' }}>{score.eachSafety}</td>
            </tr>
            <tr>
                <td>All Safeties</td>
                <td style={{ textAlign: 'right' }}>{score.allSafeties}</td>
            </tr>
            <tr>
                <td>Coup-Fourré</td>
                <td style={{ textAlign: 'right' }}>{score.coupFourré}</td>
            </tr>
            {ifCompletedUi}
            <tr style={{ fontWeight: 900 }}>
                <td>Total Score</td>
                <td style={{ textAlign: 'right' }}>{score.total}</td>
            </tr>
        </table>;
    });

    const buttonStyle: React.CSSProperties = {
        marginTop: '1em'
    };

    const scoreboardButton = sortedEntries[0][1].total < SCORE_TO_WIN
        ? <button onClick={() => onPlayNextRound(game, scores)} style={buttonStyle}>Play next round</button>
        : <button onClick={onBackToLobby} style={buttonStyle}>Game Over - Back to Lobby</button>;

    return <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', color: 'white', justifyContent: 'center', alignItems: 'center' }}>
        {teamScoresUi}
        {scoreboardButton}
    </div>;
};

export default Scoreboard;
