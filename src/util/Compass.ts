export interface Compass {
    readonly heading: number | null;
}

export function createCompass(): Compass {
    let heading: number | null = null;

    enableOrientation(e => heading = handleOrientationEvent(e));

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
    const headingDeg = 360 - e.alpha;

    return headingDeg;
}
