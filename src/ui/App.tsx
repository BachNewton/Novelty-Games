import { Routes, Route } from 'react-router-dom';
import * as R from '../routes/routes';
import HomeMenu from './HomeMenu';
import TriviaHome from '../trivia/ui/Home';
import BoardGamesMenu from './menus/BoardGamesMenu';
import MilleBornesPage from '../board-games/mille-bornes/ui/MilleBornesPage';
import LabyrinthPage from '../board-games/labyrinth/ui/LabyrinthPage';
import MonopolyPage from '../board-games/monopoly/ui/MonopolyPage';
import PokerPage from '../board-games/poker/ui/PokerPage';
import MobileGamesMenu from './menus/MobileGamesMenu';
import FreeMarketPage from '../mobile-games/free-market/ui/FreeMarketPage';
import PetsPage from '../mobile-games/pets/ui/PetsPage';
import ToddlerTreasureHuntPage from '../mobile-games/toddler-treasure-hunt/ui/ToddlerTreasureHuntPage';
import Games3DMenu from './menus/Games3DMenu';
import Game3DPage from '../game-3D/ui/Game3DPage';
import ToddlerCompanionPage from '../game-3D/ui/ToddlerCompanionPage';
import Games2DMenu from './menus/Games2DMenu';
import Game2DPage from '../game-2D/ui/Game2DPage';
import ToolsMenu from './menus/ToolsMenu';
import MusicPlayerPage from '../tools/music-player/ui/MusicPlayerPage';
import FortniteFestivalPage from '../tools/fortnite-festival/ui/FortniteFestivalPage';
import DatabaseDebugPage from '../tools/database-debug/ui/DatabaseDebugPage';
import WinterCyclingPage from '../tools/winter-cycling/ui/WinterCyclingPage';
import FractalExplorerPage from '../tools/fractal-explorer/ui/FractalExplorerPage';
import PrimeFinderPage from '../tools/prime-finder/ui/PrimeFinderPage';
import WorldExplorerPage from '../tools/world-explorer/ui/WorldExplorerPage';
import WikiGraphPage from '../tools/wiki-graph/ui/WikiGraphPage';

interface AppProps {
    updateCallbacks: {
        setOnUpdateAvailable: (callback: () => void) => void;
        setOnUpdateReady: (callback: () => void) => void;
        setOnNoUpdateFound: (callback: () => void) => void;
        setOnOffline: (callback: () => void) => void;
    };
}

const App: React.FC<AppProps> = ({ updateCallbacks }) => {
    return (
        <Routes>
            {/* Home */}
            <Route path={R.HOME.fullPath} element={<HomeMenu updateCallbacks={updateCallbacks} />} />

            {/* Trivia */}
            <Route path={R.TRIVIA.fullPath} element={<TriviaHome />} />

            {/* Board Games */}
            <Route path={R.BOARD_GAMES.fullPath} element={<BoardGamesMenu />} />
            <Route path={R.MILLE_BORNES.fullPath} element={<MilleBornesPage />} />
            <Route path={R.LABYRINTH.fullPath} element={<LabyrinthPage />} />
            <Route path={R.MONOPOLY.fullPath} element={<MonopolyPage />} />
            <Route path={R.POKER.fullPath} element={<PokerPage />} />

            {/* Mobile Games */}
            <Route path={R.MOBILE_GAMES.fullPath} element={<MobileGamesMenu />} />
            <Route path={R.FREE_MARKET.fullPath} element={<FreeMarketPage />} />
            <Route path={R.PETS.fullPath} element={<PetsPage />} />
            <Route path={R.TODDLER_TREASURE_HUNT.fullPath} element={<ToddlerTreasureHuntPage />} />

            {/* 3D Games */}
            <Route path={R.GAMES_3D.fullPath} element={<Games3DMenu />} />
            <Route path={R.MARBLE.fullPath} element={<Game3DPage game="marble" />} />
            <Route path={R.TODDLER_COMPANION.fullPath} element={<ToddlerCompanionPage />} />
            <Route path={R.KNIGHT.fullPath} element={<Game3DPage game="knight" />} />
            <Route path={R.FORTUNA.fullPath} element={<Game3DPage game="fortuna" />} />

            {/* 2D Games */}
            <Route path={R.GAMES_2D.fullPath} element={<Games2DMenu />} />
            <Route path={R.CARNIVAL.fullPath} element={<Game2DPage game="carnival" />} />
            <Route path={R.WIGGLERS.fullPath} element={<Game2DPage game="wigglers" />} />
            <Route path={R.CAT.fullPath} element={<Game2DPage game="cat" />} />
            <Route path={R.PLATFORMER.fullPath} element={<Game2DPage game="platformer" />} />
            <Route path={R.RPG.fullPath} element={<Game2DPage game="rpg" />} />
            <Route path={R.SNAKE.fullPath} element={<Game2DPage game="snake" />} />

            {/* Tools */}
            <Route path={R.TOOLS.fullPath} element={<ToolsMenu />} />
            <Route path={R.MUSIC_PLAYER.fullPath} element={<MusicPlayerPage />} />
            <Route path={R.FORTNITE_FESTIVAL.fullPath} element={<FortniteFestivalPage />} />
            <Route path={R.DATABASE_DEBUG.fullPath} element={<DatabaseDebugPage />} />
            <Route path={R.WINTER_CYCLING.fullPath} element={<WinterCyclingPage />} />
            <Route path={R.FRACTAL_EXPLORER.fullPath} element={<FractalExplorerPage />} />
            <Route path={R.PRIME_FINDER.fullPath} element={<PrimeFinderPage />} />
            <Route path={R.WORLD_EXPLORER.fullPath} element={<WorldExplorerPage />} />
            <Route path={R.WIKI_GRAPH.fullPath} element={<WikiGraphPage />} />
        </Routes>
    );
};

export default App;
