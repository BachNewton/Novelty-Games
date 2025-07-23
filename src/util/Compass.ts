const DIRECTIONS = [
    "North", "Northeast", "East", "Southeast",
    "South", "Southwest", "West", "Northwest",
];

export interface Compass {
    readonly heading: number | null;
}

export function createCompass(onHeadingUpdate: (heading: number) => void): Compass {
    let heading: number | null = null;

    enableOrientation(e => {
        heading = handleOrientationEvent(e);

        if (heading !== null) {
            onHeadingUpdate(heading);
        }
    });

    return {
        get heading() { return heading; }
    };
}

function enableOrientation(onOrientationEvent: (e: DeviceOrientationEvent) => void) {
    // For iOS 13+ devices, we need to request permission.
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
            .then((permissionState: 'granted' | 'denied' | 'default') => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', onOrientationEvent, true);
                }
            })
            .catch(console.error);
    } else {
        // For other devices, we can just add the event listener.
        window.addEventListener('deviceorientation', onOrientationEvent, true);
    }
}

function handleOrientationEvent(e: DeviceOrientationEvent): number | null {
    if (e.alpha === null) return null;

    // The alpha value is the compass direction the device is facing,
    // ranging from 0 to 360 degrees.
    // 0 is North.
    const heading = (360 - (e.alpha + 90) + 360) % 360;

    return heading;
}

export function getDirection(heading: number): string {
    const index = Math.round(heading / 45) % 8;
    const direction = DIRECTIONS[index];

    return direction;
}
