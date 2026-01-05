import * as THREE from 'three';

// High contrast gradient: warm (source) → cool (target)
const SOURCE_COLOR = new THREE.Color(0.95, 0.6, 0.2);  // Orange
const TARGET_COLOR = new THREE.Color(0.2, 0.85, 0.9);  // Cyan
const BIDIRECTIONAL_COLOR = new THREE.Color(0.5, 0.4, 0.95);  // Purple

const SOURCE_RADIUS = 0.015;
const TARGET_RADIUS = 0.03;
const RADIAL_SEGMENTS = 6;

export interface LinkFactory {
    createLink: (isBidirectional: boolean) => THREE.Mesh;
    updateLinkPositions: (link: THREE.Mesh, sourcePos: THREE.Vector3, targetPos: THREE.Vector3) => void;
    setBidirectional: (link: THREE.Mesh) => void;
}

function createTaperedGeometry(): THREE.CylinderGeometry {
    // CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded)
    // After rotation and orientation: top → source, bottom → target
    const geometry = new THREE.CylinderGeometry(
        SOURCE_RADIUS,  // radiusTop (source end)
        TARGET_RADIUS,  // radiusBottom (target end)
        1,              // height (scaled in updateLinkPositions)
        RADIAL_SEGMENTS,
        1,
        true            // openEnded
    );

    // Rotate so we can orient it properly
    geometry.rotateX(Math.PI);

    // Apply vertex colors for gradient
    const colors: number[] = [];
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        // y ranges from -0.5 (target) to 0.5 (source) after rotation
        const t = y + 0.5; // 0 = target, 1 = source

        const r = SOURCE_COLOR.r * t + TARGET_COLOR.r * (1 - t);
        const g = SOURCE_COLOR.g * t + TARGET_COLOR.g * (1 - t);
        const b = SOURCE_COLOR.b * t + TARGET_COLOR.b * (1 - t);

        colors.push(r, g, b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    return geometry;
}

function createTaperedMaterial(): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
}

// Reusable vectors for orientation calculations
const direction = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);
const quaternion = new THREE.Quaternion();

export function createLinkFactory(): LinkFactory {
    return {
        createLink: (isBidirectional) => {
            const geometry = createTaperedGeometry();

            // Override colors if bidirectional
            if (isBidirectional) {
                const colors: number[] = [];
                const positions = geometry.attributes.position;
                for (let i = 0; i < positions.count; i++) {
                    colors.push(BIDIRECTIONAL_COLOR.r, BIDIRECTIONAL_COLOR.g, BIDIRECTIONAL_COLOR.b);
                }
                geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            }

            const material = createTaperedMaterial();
            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData.isBidirectional = isBidirectional;

            return mesh;
        },

        updateLinkPositions: (link, sourcePos, targetPos) => {
            // Calculate midpoint and distance
            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;
            const midZ = (sourcePos.z + targetPos.z) / 2;

            const distance = sourcePos.distanceTo(targetPos);

            // Position at midpoint
            link.position.set(midX, midY, midZ);

            // Scale to match distance (geometry has height 1)
            link.scale.set(1, distance, 1);

            // Orient to point from source to target
            direction.subVectors(targetPos, sourcePos).normalize();
            quaternion.setFromUnitVectors(up, direction);
            link.quaternion.copy(quaternion);
        },

        setBidirectional: (link) => {
            link.userData.isBidirectional = true;

            const geometry = link.geometry as THREE.CylinderGeometry;
            const colors: number[] = [];
            const positions = geometry.attributes.position;

            for (let i = 0; i < positions.count; i++) {
                colors.push(BIDIRECTIONAL_COLOR.r, BIDIRECTIONAL_COLOR.g, BIDIRECTIONAL_COLOR.b);
            }

            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        }
    };
}
