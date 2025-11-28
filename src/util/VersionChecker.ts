import { APP_VERSION } from '../Versioning';

/**
 * Compares two version strings (e.g., "v6.12.4")
 * Returns: 1 if version1 > version2, -1 if version1 < version2, 0 if equal
 */
export function compareVersions(version1: string, version2: string): number {
    // Remove 'v' prefix if present and split by '.'
    const v1Parts = version1.replace(/^v/, '').split('.').map(Number);
    const v2Parts = version2.replace(/^v/, '').split('.').map(Number);

    // Ensure both arrays have the same length
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    while (v1Parts.length < maxLength) v1Parts.push(0);
    while (v2Parts.length < maxLength) v2Parts.push(0);

    for (let i = 0; i < maxLength; i++) {
        if (v1Parts[i] > v2Parts[i]) return 1;
        if (v1Parts[i] < v2Parts[i]) return -1;
    }

    return 0;
}

/**
 * Fetches the current version from the server
 * Returns the version string or null if fetch fails
 */
export async function fetchServerVersion(): Promise<string | null> {
    try {
        // Add cache-busting query parameter to ensure we get the latest version
        const response = await fetch(`${process.env.PUBLIC_URL}/version.json?t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch version: ${response.status}`);
        }

        const data = await response.json();
        return data.version || null;
    } catch (error) {
        console.error('Error fetching server version:', error);
        return null;
    }
}

/**
 * Checks if there's a newer version available on the server
 * Returns: true if server version is newer, false if same or older, null if check failed
 */
export async function checkForUpdate(): Promise<boolean | null> {
    const serverVersion = await fetchServerVersion();

    if (!serverVersion) {
        return null; // Unable to check
    }

    const comparison = compareVersions(serverVersion, APP_VERSION);
    return comparison > 0; // Server version is newer
}

