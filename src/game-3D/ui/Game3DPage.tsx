import Game3D, { Game } from './Game3D';
import HomeButton from '../../ui/HomeButton';

interface Game3DPageProps {
    game: 'marble' | 'knight' | 'fortuna';
}

const gameMap: Record<string, Game> = {
    marble: Game.MARBLE,
    knight: Game.KNIGHT,
    fortuna: Game.FORTUNA
};

const Game3DPage: React.FC<Game3DPageProps> = ({ game }) => {
    return (
        <>
            <HomeButton />
            <Game3D game={gameMap[game]} />
        </>
    );
};

export default Game3DPage;
