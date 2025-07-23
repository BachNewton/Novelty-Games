import { isLocalhost } from "../Localhost";

/**
 * The cardinal and intercardinal directions.
 */
const DIRECTIONS = [
    "North", "Northeast", "East", "Southeast",
    "South", "Southwest", "West", "Northwest",
];

/**
 * Defines the public interface for the compass, providing a readonly heading.
 */
export interface Compass {
    readonly heading: number | null;
    start: () => Promise<void>; // Function to start listening for events
    stop: () => void; // Function to stop listening
}

/**
 * Creates and manages a compass instance.
 * @param onHeadingUpdate A callback function that fires whenever the heading is updated.
 */
export function createCompass(onHeadingUpdate: (heading: number) => void): Compass {
    let heading: number | null = null;
    let orientationListener: ((e: DeviceOrientationEvent) => void) | null = null;

    const start = async () => {
        // Remove any existing listener
        if (orientationListener) {
            stop();
        }

        // Define the handler that will be used for the event listener.
        orientationListener = (event: DeviceOrientationEvent) => {
            const newHeading = handleOrientationEvent(event);

            if (newHeading !== null) {
                heading = newHeading;
                onHeadingUpdate(heading);
            }
        };

        // For iOS 13+ devices, we must request permission.
        // This MUST be called within a user-initiated event handler (e.g., a click).
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            const permissionState = await (DeviceOrientationEvent as any).requestPermission();
            if (permissionState !== 'granted') {
                console.error("Permission to access device orientation was denied.");
                return;
            }
        }

        window.addEventListener(getEventName(), orientationListener as EventListener, true);
    };

    const stop = () => {
        if (orientationListener) {
            window.removeEventListener(getEventName(), orientationListener as EventListener, true);
            orientationListener = null;
        }
    };

    return {
        get heading() { return heading; },
        start,
        stop,
    };
}

/**
 * Prefer the 'absolute' event, which is relative to true north.
 * Fall back to the standard 'deviceorientation' event.
 */
function getEventName(): keyof WindowEventMap {
    const useAbsolute = 'ondeviceorientationabsolute' in window && !isLocalhost();
    const eventName = useAbsolute ? 'deviceorientationabsolute' : 'deviceorientation';

    return eventName as keyof WindowEventMap;
}

/**
 * Processes the device orientation event to calculate a reliable compass heading.
 * @param event The DeviceOrientationEvent.
 * @returns The calculated compass heading in degrees (0-360), or null if unavailable.
 */
function handleOrientationEvent(event: DeviceOrientationEvent): number | null {
    // The 'webkitCompassHeading' property is the most reliable source on iOS.
    // It gives a direct reading from the magnetometer.
    let compassHeading = (event as any).webkitCompassHeading as number | undefined;

    if (compassHeading !== undefined) {
        // The value is already a heading, no complex math needed.
        return compassHeading;
    }

    // For other devices, use the alpha value.
    // Alpha is the rotation around the Z-axis, where 0 is north.
    if (event.alpha === null) {
        return null;
    }

    // We need to check if the alpha value is absolute (relative to North)
    if (!event.absolute && !isLocalhost()) {
        // If alpha is not absolute, it's relative to the device's initial
        // position. This is not useful for a compass. We return null.
        console.warn("DeviceOrientationEvent.alpha is not absolute.");
        return null;
    }

    // The alpha value is 0-360, with 0 being North.
    // The calculation '360 - alpha' is sometimes needed depending on device
    // interpretation, but a direct alpha is often correct for absolute events.
    // We adjust it for the screen orientation.
    const screenAngle = window.screen.orientation.angle || window.orientation || 0;
    const heading = 360 - event.alpha - (typeof screenAngle === 'number' ? screenAngle : 0);

    // Normalize the heading to be within 0-360.
    return (heading + 360) % 360;
}


/**
 * Converts a heading in degrees to a cardinal or intercardinal direction string.
 * @param heading A number from 0 to 360.
 * @returns The direction string (e.g., "Northeast").
 */
export function getDirection(heading: number): string {
    // Each of the 8 directions covers a 45-degree arc (360 / 8 = 45).
    // We add 22.5 to center the heading within each arc before dividing.
    const index = Math.floor((heading + 22.5) / 45) % 8;
    return DIRECTIONS[index];
}
