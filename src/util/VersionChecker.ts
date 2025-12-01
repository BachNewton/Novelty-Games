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
            console.warn('Service worker update timeout - resolving anyway');
            // Resolve even on timeout, as the update may still be in progress
            resolve();
        }, 20000); // 20 second timeout

        const currentController = navigator.serviceWorker.controller;
        const currentControllerUrl = currentController?.scriptURL || null;
        let waitingWorkerUrl: string | null = null;
        let swReadyReceived = false;

        const cleanup = () => {
            clearTimeout(timeout);
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            navigator.serviceWorker.removeEventListener('message', handleMessage);
            if (registration.installing) {
                registration.installing.removeEventListener('statechange', handleInstallingStateChange);
            }
            if (registration.waiting) {
                registration.waiting.removeEventListener('statechange', handleWaitingStateChange);
            }
        };

        // Polling fallback to check if controller changed
        let pollInterval: NodeJS.Timeout | null = null;
        const startPolling = () => {
            if (pollInterval) return; // Already polling
            pollInterval = setInterval(() => {
                const newController = navigator.serviceWorker.controller;
                const newControllerUrl = newController?.scriptURL || null;
                if (newControllerUrl && newControllerUrl !== currentControllerUrl) {
                    console.log('Polling detected controller change');
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        pollInterval = null;
                    }
                    safeResolve();
                }
            }, 500); // Check every 500ms
        };

        // Track if we've already resolved
        let resolved = false;
        const safeResolve = () => {
            if (!resolved) {
                resolved = true;
                if (pollInterval) {
                    clearInterval(pollInterval);
                    pollInterval = null;
                }
                cleanup();

                // Verify the controller actually changed or we got confirmation
                const newController = navigator.serviceWorker.controller;
                const newControllerUrl = newController?.scriptURL || null;

                const controllerChanged = newControllerUrl && newControllerUrl !== currentControllerUrl;
                const isNewWorker = waitingWorkerUrl && newControllerUrl === waitingWorkerUrl;

                if (controllerChanged || isNewWorker || swReadyReceived) {
                    console.log('Service worker update confirmed, waiting for ready state...');
                    // Wait for the service worker to be ready
                    navigator.serviceWorker.ready.then(() => {
                        console.log('Service worker is ready');
                        // Give a small delay to ensure precaching is complete
                        setTimeout(() => resolve(), 1000);
                    }).catch(() => {
                        // Even if ready fails, resolve after a delay
                        console.log('Service worker ready check failed, resolving anyway');
                        setTimeout(() => resolve(), 1500);
                    });
                } else {
                    // Controller didn't change yet, but resolve anyway after delay
                    console.log('Controller not changed yet, but resolving after delay');
                    setTimeout(() => resolve(), 2000);
                }
            }
        };

        // Handle messages from service worker
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'SW_READY') {
                console.log('Service worker confirmed it is ready');
                swReadyReceived = true;
                safeResolve();
            }
        };

        // Handle controller change - this fires when a new service worker takes control
        const handleControllerChange = () => {
            console.log('Service worker controller changed');
            const newController = navigator.serviceWorker.controller;
            if (newController) {
                console.log('New controller URL:', newController.scriptURL);
                // Request confirmation from service worker
                newController.postMessage({ type: 'CHECK_READY' });
            }
            // Resolve after a short delay
            setTimeout(() => safeResolve(), 1000);
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
                    waitingWorkerUrl = waitingWorker.scriptURL;
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
                // Wait a moment for controller change, then check
                setTimeout(() => {
                    const newController = navigator.serviceWorker.controller;
                    if (newController) {
                        console.log('Controller after activation:', newController.scriptURL);
                        newController.postMessage({ type: 'CHECK_READY' });
                    }
                    safeResolve();
                }, 1000);
            }
        };

        // Set up listeners
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
        navigator.serviceWorker.addEventListener('message', handleMessage);

        // Start polling as fallback
        startPolling();

        // If there's already a waiting service worker, activate it
        if (registration.waiting) {
            const waitingWorker = registration.waiting;
            waitingWorkerUrl = waitingWorker.scriptURL;
            waitingWorker.addEventListener('statechange', handleWaitingStateChange);
            console.log('Found waiting worker, sending SKIP_WAITING');
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });

            // If already activated, resolve after checking controller
            if (waitingWorker.state === 'activated') {
                setTimeout(() => {
                    const newController = navigator.serviceWorker.controller;
                    if (newController) {
                        newController.postMessage({ type: 'CHECK_READY' });
                    }
                    safeResolve();
                }, 1000);
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
                waitingWorkerUrl = waitingWorker.scriptURL;
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

                // Wait for service worker to be ready (ensures precaching is done)
                await navigator.serviceWorker.ready;
                console.log('Service worker is ready');

                // Give a small additional delay to ensure everything is cached
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.warn('Error waiting for service worker update:', error);
                // Continue anyway - the update may still be in progress
                // Wait a bit before showing the button
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

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
