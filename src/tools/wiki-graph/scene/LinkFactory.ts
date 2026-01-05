import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

const GREY = [0.4, 0.4, 0.5];
const BLUE = [0.3, 0.8, 0.77];

export interface LinkFactory {
    createLink: (isBidirectional: boolean) => Line2;
    updateLinkPositions: (line: Line2, sourcePos: THREE.Vector3, targetPos: THREE.Vector3) => void;
    setBidirectional: (line: Line2) => void;
}

export function createLinkFactory(): LinkFactory {
    return {
        createLink: (isBidirectional) => {
            const geometry = new LineGeometry();
            geometry.setPositions([0, 0, 0, 0, 0, 0]);

            const startColor = isBidirectional ? BLUE : GREY;
            geometry.setColors([...startColor, ...BLUE]);

            const material = new LineMaterial({
                vertexColors: true,
                linewidth: 1,
                transparent: true,
                opacity: 0.6,
                resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
            });

            const line = new Line2(geometry, material);
            line.computeLineDistances();

            return line;
        },

        updateLinkPositions: (line, sourcePos, targetPos) => {
            const geometry = line.geometry as LineGeometry;
            geometry.setPositions([
                sourcePos.x, sourcePos.y, sourcePos.z,
                targetPos.x, targetPos.y, targetPos.z
            ]);
        },

        setBidirectional: (line) => {
            const geometry = line.geometry as LineGeometry;
            geometry.setColors([...BLUE, ...BLUE]);
        }
    };
}
