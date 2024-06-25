import { Team } from "../logic/Data";
import { Score } from "../logic/ScoreboardCalculator";

interface ScoreboardProps {
    scores: Map<Team, Score>;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ scores }) => {
    console.log(scores);

    return <div>
        This is the Scoreboard
    </div>;
};

export default Scoreboard;
