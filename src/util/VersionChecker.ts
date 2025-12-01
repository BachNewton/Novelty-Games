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
 * Waits for a service worker to be installed, activated, and ready
 */
function waitForServiceWorkerUpdate(registration: ServiceWorkerRegistration): Promise<void> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Service worker update timeout'));
        }, 60000); // 60 second timeout

        const cleanup = () => {
            clearTimeout(timeout);
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            if (registration.installing) {
                registration.installing.removeEventListener('statechange', handleInstallingStateChange);
            }
            if (registration.waiting) {
                registration.waiting.removeEventListener('statechange', handleWaitingStateChange);
            }
        };

        // Track if we've already resolved
        let resolved = false;
        const safeResolve = () => {
            if (!resolved) {
                resolved = true;
                cleanup();
                // Give a small delay to ensure precaching is complete
                setTimeout(() => resolve(), 1000);
            }
        };

        // Handle controller change - this fires when a new service worker takes control
        const handleControllerChange = () => {
            console.log('Service worker controller changed - new worker is active');
            safeResolve();
        };

        // Handle installing worker state changes
        const handleInstallingStateChange = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            console.log(`Installing worker state: ${installingWorker.state}`);

            if (installingWorker.state === 'installed') {
                console.log('New service worker installed');
                // Check if it's now waiting
                if (registration.waiting) {
                    const waitingWorker = registration.waiting;
                    console.log('Sending SKIP_WAITING to waiting worker');
                    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
            }
        };

        // Handle waiting worker state changes
        const handleWaitingStateChange = () => {
            const waitingWorker = registration.waiting;
            if (!waitingWorker) return;

            console.log(`Waiting worker state: ${waitingWorker.state}`);

            if (waitingWorker.state === 'activated') {
                console.log('Waiting worker activated');
                safeResolve();
            }
        };

        // Set up listeners
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        // If there's already a waiting service worker, activate it
        if (registration.waiting) {
            const waitingWorker = registration.waiting;
            waitingWorker.addEventListener('statechange', handleWaitingStateChange);
            console.log('Found waiting worker, sending SKIP_WAITING');
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });

            // If already activated, resolve immediately
            if (waitingWorker.state === 'activated') {
                safeResolve();
            }
            return;
        }

        // If there's an installing worker, wait for it
        if (registration.installing) {
            const installingWorker = registration.installing;
            installingWorker.addEventListener('statechange', handleInstallingStateChange);
            // Check current state
            if (installingWorker.state === 'installed' && registration.waiting) {
                const waitingWorker: ServiceWorker = registration.waiting;
                waitingWorker.addEventListener('statechange', handleWaitingStateChange);
                waitingWorker.postMessage({ type: 'SKIP_WAITING' });
            }
            return;
        }

        // Set up listener for when update is found
        registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
                installingWorker.addEventListener('statechange', handleInstallingStateChange);
            }
        };
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
            console.log('Newer version detected remotely, forcing service worker update');

            // Notify that an update is available and installation is starting
            callbacks.onUpdateAvailable();

            // Force service worker to check for updates
            await registration.update();

            // Wait for the service worker to be installed and activated
            try {
                console.log('Waiting for service worker update to complete...');
                await waitForServiceWorkerUpdate(registration);
                console.log('Service worker update completed and activated');
            } catch (error) {
                console.warn('Error waiting for service worker update:', error);
                // Continue anyway - the update may still be in progress
            }

            // Give a small delay to ensure precaching is complete
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Registration updated and ready');
            callbacks.onUpdateReady();
        } else {
            console.log('Version is up to date');
            callbacks.onUpToDate();
        }
    } catch (error) {
        console.error('Error during version check:', error);
        callbacks.onCheckFailed();
    }
}
