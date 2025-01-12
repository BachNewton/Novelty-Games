export enum Route {
    MARBLE_GAME = 'Marble',
    KNIGHT_GAME = 'Knight',
    FREE_MARKET = 'Free-Market'
}

export function getRoute(): string | null {
    const pathNames = window.location.pathname.split('/');

    if (pathNames.length < 3) return null;

    return pathNames[2];
}

export function updateRoute(route: Route) {
    window.history.pushState(null, '', `/Novelty-Games/${route}`);
}
