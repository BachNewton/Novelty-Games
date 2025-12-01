import { APP_VERSION } from "../Versioning";

const REMOTE_VERSION_URL = 'https://raw.githubusercontent.com/BachNewton/Novelty-Games/main/src/Versioning.ts';

export type VersionCheckCallbacks = {
    onUpdateAvailable: () => void;
    onUpToDate: () => void;
    onOffline: () => void;
    onCheckFailed: () => void;
};

/**
 * Fetches the remote version from GitHub and extracts the version string
 */
async function fetchRemoteVersion(): Promise<string | null> {
    try {
        const response = await fetch(REMOTE_VERSION_URL, {
            cache: 'no-store', // Always fetch fresh version
        });

        if (!response.ok) {
            console.warn('Failed to fetch remote version:', response.status);
            return null;
        }

        const text = await response.text();
        const match = text.match(/export const APP_VERSION = \'(.+)\';/);
        return match ? match[1] : null;
    } catch (error) {
        console.warn('Error fetching remote version:', error);
        return null;
    }
}

/**
 * Checks if a newer version is available remotely and forces update if needed
 */
export async function checkVersionAndForceUpdate(
    registration: ServiceWorkerRegistration,
    callbacks: VersionCheckCallbacks
): Promise<void> {
    if (!navigator.onLine) {
        callbacks.onOffline();
        return; // Skip check if offline
    }

    try {
        const remoteVersion = await fetchRemoteVersion();
        if (!remoteVersion) {
            console.log('Could not fetch remote version, skipping version check');
            callbacks.onCheckFailed();
            return;
        }

        const localVersion = APP_VERSION;
        console.log(`Version check: Local=${localVersion}, Remote=${remoteVersion}`);

        if (remoteVersion !== localVersion) {
            console.log('Newer version detected remotely, forcing service worker update');

            // Force service worker to check for updates
            await registration.update();

            // If there's a waiting service worker, skip waiting
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }

            console.log('Registration updated');
            callbacks.onUpdateAvailable();
        } else {
            console.log('Version is up to date');
            callbacks.onUpToDate();
        }
    } catch (error) {
        console.error('Error during version check:', error);
        callbacks.onCheckFailed();
    }
}
