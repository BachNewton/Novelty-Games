/**
 * Utility to manage service worker registration for update functionality
 */

let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

/**
 * Store the service worker registration
 */
export function setServiceWorkerRegistration(registration: ServiceWorkerRegistration) {
  serviceWorkerRegistration = registration;
}

/**
 * Get the current service worker registration
 */
export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return serviceWorkerRegistration;
}

/**
 * Activate the waiting service worker and reload the page
 */
export async function activateUpdate(): Promise<void> {
  // Try to get registration from stored value or from navigator
  let registration = serviceWorkerRegistration;
  
  if (!registration && 'serviceWorker' in navigator) {
    try {
      registration = await navigator.serviceWorker.ready;
    } catch (error) {
      console.error('Error getting service worker registration:', error);
    }
  }

  const waitingWorker = registration?.waiting;
  
  if (waitingWorker) {
    // Set up listener for when the new service worker takes control
    const handleControllerChange = () => {
      window.location.reload();
    };
    
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    
    // Tell the waiting service worker to skip waiting and activate
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    
    // Fallback: reload after a delay if controller change doesn't fire
    setTimeout(() => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      window.location.reload();
    }, 1000);
  } else {
    // No waiting worker, just reload
    window.location.reload();
  }
}

