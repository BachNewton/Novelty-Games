import { APP_VERSION } from "../Versioning";

const REMOTE_VERSION_URL = 'https://raw.githubusercontent.com/BachNewton/Novelty-Games/main/src/Versioning.ts';

export type VersionCheckCallbacks = {
    onUpdateAvailable: () => void;
    onUpdateReady: () => void;
    onUpToDate: () => void;
    onOffline: () => void;
    onCheckFailed: () => void;
};

/**
 * Fetches the remote version from GitHub and extracts the version string
 */
async function fetchRemoteVersion(): Promise<string | null> {
    try {
        // Cache-busting is CRITICAL here. 
        // We append a timestamp so the browser never serves an old version.json from disk cache.
        const response = await fetch(`${REMOTE_VERSION_URL}?t=${Date.now()}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            console.warn('Failed to fetch remote version:', response.status);
            return null;
        }

        const text = await response.text();
        const match = text.match(/export const APP_VERSION = '(.+)';/);
        return match ? match[1] : null;
    } catch (error) {
        console.warn('Error fetching remote version:', error);
        return null;
    }
}

/**
 * Forces the waiting or installing service worker to become active
 * and waits for it to take control of the page.
 */
function forceServiceWorkerActivation(registration: ServiceWorkerRegistration): Promise<void> {
    return new Promise((resolve, reject) => {
        // 1. Set up the listener for when the new SW takes over.
        // We do this BEFORE posting the message to ensure we don't miss the event.
        const handleControllerChange = () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            console.log('Controller changed. New Service Worker is active.');
            resolve();
        };

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        // 2. Locate the new worker (it could be waiting or installing)
        const newWorker = registration.installing || registration.waiting;

        if (!newWorker) {
            // Edge case: update() was called, but browser decided files are identical.
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            resolve();
            return;
        }

        // 3. Helper to send the signal
        const sendSkipWaiting = () => {
            console.log('Sending SKIP_WAITING command...');
            newWorker.postMessage({ type: 'SKIP_WAITING' });
        };

        // 4. If it's already installed and waiting, activate it immediately.
        if (newWorker.state === 'installed') {
            sendSkipWaiting();
        } else {
            // 5. If it's still installing, wait for it to finish, then activate.
            const handleStateChange = () => {
                if (newWorker.state === 'installed') {
                    newWorker.removeEventListener('statechange', handleStateChange);
                    sendSkipWaiting();
                }
            };
            newWorker.addEventListener('statechange', handleStateChange);
        }
    });
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
            console.log('Update detected. Starting update process...');
            callbacks.onUpdateAvailable();

            // 1. Force the browser to check for the new SW file
            await registration.update();

            // 2. Wait for the new SW to install and take control
            await forceServiceWorkerActivation(registration);

            // 3. Done
            console.log('Update complete.');
            callbacks.onUpdateReady();
        } else {
            console.log('Version is up to date');
            callbacks.onUpToDate();
        }
    } catch (error) {
        console.error('Update failed:', error);
        callbacks.onCheckFailed();
    }
}
