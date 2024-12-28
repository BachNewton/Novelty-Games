export const ROUTES = {
    MARBLE_GAME: 'Marble'
};

export function getRoute(): string | null {
    const pathNames = window.location.pathname.split('/');

    if (pathNames.length < 3) return null;

    return pathNames[2];
}

export function updateRoute(route: string) {
    window.history.pushState(null, '', `/Novelty-Games/${route}`);
}
