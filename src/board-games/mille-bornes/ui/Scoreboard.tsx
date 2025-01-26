import { Game, Team } from "../logic/Data";
import { Score, calculateScore } from "../logic/ScoreboardCalculator";
import { getTeamName } from "./UiUtil";

const SCORE_TO_WIN = 5000;

interface ScoreboardProps {
    game: Game;
    onBackToLobby: () => void;
    onPlayNextRound: (game: Game, scores: Map<Team, Score>) => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ game, onBackToLobby, onPlayNextRound }) => {
    const scores = calculateScore(game);
    const sortedEntries = Array.from(scores.entries()).sort((a, b) => b[1].gameTotal - a[1].gameTotal);

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
            <thead>
                <tr>
                    <th>#{index + 1}: {getTeamName(team)}</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody>
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
                    <td>Round Score</td>
                    <td style={{ textAlign: 'right' }}>{score.roundTotal}</td>
                </tr>
                <tr style={{ fontWeight: 900 }}>
                    <td>Game Score</td>
                    <td style={{ textAlign: 'right' }}>{score.gameTotal}</td>
                </tr>
            </tbody>
        </table>;
    });

    const footerStyle: React.CSSProperties = {
        marginTop: '1em'
    };

    const isGameOver = sortedEntries[0][1].gameTotal >= SCORE_TO_WIN;

    const declareWinner = isGameOver
        ? <div style={footerStyle}>Game Over! {getTeamName(sortedEntries[0][0])} wins!</div>
        : <></>;

    const scoreboardButton = isGameOver
        ? <button onClick={onBackToLobby} style={footerStyle}>Back to Lobby</button>
        : <button onClick={() => onPlayNextRound(game, scores)} style={footerStyle}>Play next round</button>;

    return <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', color: 'white', justifyContent: 'center', alignItems: 'center' }}>
        {teamScoresUi}
        {declareWinner}
        {scoreboardButton}
    </div>;
};

export default Scoreboard;
