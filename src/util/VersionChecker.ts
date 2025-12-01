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
 * Waits for a service worker update to be installed and activated
 * Uses the standard PWA pattern: wait for installed -> skipWaiting -> controllerchange -> ready
 */
function waitForServiceWorkerUpdate(registration: ServiceWorkerRegistration): Promise<void> {
    return new Promise((resolve) => {
        // Wait for controller change (new service worker takes control)
        const waitForControllerChange = (): Promise<void> => {
            return new Promise((resolveController) => {
                const handleControllerChange = () => {
                    navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
                    resolveController();
                };
                navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
            });
        };

        // If there's already a waiting worker, activate it and wait for controller change
        if (registration.waiting) {
            console.log('Found waiting worker, activating...');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });

            waitForControllerChange()
                .then(() => navigator.serviceWorker.ready)
                .then(() => {
                    console.log('Service worker is ready');
                    resolve();
                })
                .catch((error) => {
                    console.warn('Error waiting for service worker update:', error);
                    setTimeout(() => resolve(), 2000);
                });
            return;
        }

        // Wait for the service worker to be installed (goes to waiting state)
        const waitForInstalled = (): Promise<void> => {
            return new Promise((resolveInstalled) => {
                if (registration.waiting) {
                    resolveInstalled();
                    return;
                }

                if (registration.installing) {
                    const installingWorker = registration.installing;
                    const handleStateChange = () => {
                        if (installingWorker.state === 'installed') {
                            installingWorker.removeEventListener('statechange', handleStateChange);
                            resolveInstalled();
                        }
                    };
                    installingWorker.addEventListener('statechange', handleStateChange);

                    // Check if already installed
                    if (installingWorker.state === 'installed') {
                        installingWorker.removeEventListener('statechange', handleStateChange);
                        resolveInstalled();
                    }
                } else {
                    // Set up listener for when update is found
                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        if (installingWorker) {
                            const handleStateChange = () => {
                                if (installingWorker.state === 'installed') {
                                    installingWorker.removeEventListener('statechange', handleStateChange);
                                    resolveInstalled();
                                }
                            };
                            installingWorker.addEventListener('statechange', handleStateChange);
                        }
                    };
                }
            });
        };

        // Main flow: wait for installed -> activate -> controllerchange -> ready
        waitForInstalled()
            .then(() => {
                // Service worker is installed, activate it
                if (registration.waiting) {
                    console.log('Activating waiting service worker...');
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                // Wait for controller change
                return waitForControllerChange();
            })
            .then(() => {
                console.log('Service worker controller changed, waiting for ready...');
                // Wait for service worker to be ready
                return navigator.serviceWorker.ready;
            })
            .then(() => {
                console.log('Service worker is ready');
                resolve();
            })
            .catch((error) => {
                console.warn('Error waiting for service worker update:', error);
                // Resolve anyway after a delay - update may still work
                setTimeout(() => resolve(), 2000);
            });
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

            // Wait for the service worker to be installed, activated, and ready
            console.log('Waiting for service worker update to complete...');
            await waitForServiceWorkerUpdate(registration);
            console.log('Service worker update completed and ready');

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
