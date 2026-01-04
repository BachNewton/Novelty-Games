// Route node interface
export interface RouteNode {
    readonly segment: string;
    readonly fullPath: string;
}

// Factory function - computes full path from parent
function createRoute(segment: string, parent?: RouteNode): RouteNode {
    const fullPath = parent
        ? `${parent.fullPath}/${segment}`
        : segment === '' ? '/' : `/${segment}`;
    return { segment, fullPath };
}

// Root routes
export const HOME = createRoute('');
export const TRIVIA = createRoute('trivia');

// Board Games hierarchy
export const BOARD_GAMES = createRoute('board-games');
export const MILLE_BORNES = createRoute('mille-bornes', BOARD_GAMES);
export const LABYRINTH = createRoute('labyrinth', BOARD_GAMES);
export const MONOPOLY = createRoute('monopoly', BOARD_GAMES);
export const POKER = createRoute('poker', BOARD_GAMES);

// Mobile Games hierarchy
export const MOBILE_GAMES = createRoute('mobile-games');
export const FREE_MARKET = createRoute('free-market', MOBILE_GAMES);
export const PETS = createRoute('pets', MOBILE_GAMES);
export const TODDLER_TREASURE_HUNT = createRoute('toddler-treasure-hunt', MOBILE_GAMES);

// 3D Games hierarchy
export const GAMES_3D = createRoute('3d-games');
export const MARBLE = createRoute('marble', GAMES_3D);
export const TODDLER_COMPANION = createRoute('toddler-companion', GAMES_3D);
export const KNIGHT = createRoute('knight', GAMES_3D);
export const FORTUNA = createRoute('fortuna', GAMES_3D);

// 2D Games hierarchy
export const GAMES_2D = createRoute('2d-games');
export const CARNIVAL = createRoute('carnival', GAMES_2D);
export const WIGGLERS = createRoute('wigglers', GAMES_2D);
export const CAT = createRoute('cat', GAMES_2D);
export const PLATFORMER = createRoute('platformer', GAMES_2D);
export const RPG = createRoute('rpg', GAMES_2D);
export const SNAKE = createRoute('snake', GAMES_2D);

// Tools hierarchy
export const TOOLS = createRoute('tools');
export const MUSIC_PLAYER = createRoute('music-player', TOOLS);
export const FORTNITE_FESTIVAL = createRoute('fortnite-festival', TOOLS);
export const DATABASE_DEBUG = createRoute('database-debug', TOOLS);
export const WINTER_CYCLING = createRoute('winter-cycling', TOOLS);
export const FRACTAL_EXPLORER = createRoute('fractal-explorer', TOOLS);
export const PRIME_FINDER = createRoute('prime-finder', TOOLS);
export const WORLD_EXPLORER = createRoute('world-explorer', TOOLS);
export const WIKI_GRAPH = createRoute('wiki-graph', TOOLS);
