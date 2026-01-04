import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons';

function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export interface CameraAnimator {
    animateTo: (target: THREE.Vector3, duration?: number) => void;
    update: (deltaTime: number) => void;
    isAnimating: () => boolean;
    cancel: () => void;
}

export function createCameraAnimator(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls
): CameraAnimator {
    let animating = false;
    let startTarget = new THREE.Vector3();
    let endTarget = new THREE.Vector3();
    let startCameraPos = new THREE.Vector3();
    let elapsed = 0;
    let duration = 1000;

    return {
        animateTo: (target, dur = 1000) => {
            startTarget = controls.target.clone();
            startCameraPos = camera.position.clone();
            endTarget = target.clone();
            elapsed = 0;
            duration = dur;
            animating = true;
        },

        update: (deltaTime) => {
            if (!animating) return;

            elapsed += deltaTime;
            const t = easeInOutCubic(Math.min(elapsed / duration, 1));

            controls.target.lerpVectors(startTarget, endTarget, t);

            const offset = startCameraPos.clone().sub(startTarget);
            camera.position.copy(controls.target.clone().add(offset));

            controls.update();

            if (elapsed >= duration) {
                animating = false;
            }
        },

        isAnimating: () => animating,

        cancel: () => {
            animating = false;
        }
    };
}
