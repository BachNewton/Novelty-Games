import { useNavigate } from 'react-router-dom';
import { GAMES_2D } from '../../routes/routes';
import Game2D from './Game2D';
import { GameWorldType } from '../worlds/GameWorldType';

interface Game2DPageProps {
    game: 'carnival' | 'wigglers' | 'cat' | 'platformer' | 'rpg' | 'snake';
}

const gameMap: Record<string, GameWorldType> = {
    carnival: GameWorldType.CARNIVAL,
    wigglers: GameWorldType.WIGGLERS,
    cat: GameWorldType.CAT,
    platformer: GameWorldType.PLATFORMER,
    rpg: GameWorldType.RPG,
    snake: GameWorldType.SNAKE
};

const Game2DPage: React.FC<Game2DPageProps> = ({ game }) => {
    const navigate = useNavigate();

    return <Game2D goHome={() => navigate(GAMES_2D.fullPath)} gameWorldType={gameMap[game]} />;
};

export default Game2DPage;
