import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Marble, ScoringHole, MARBLE_RADIUS, LAUNCHER_POWER } from './types';

export function createMarble(
    scene: THREE.Scene,
    world: CANNON.World,
    launcherPosition: THREE.Vector3,
    scoringHoles: ScoringHole[],
    onScoreUpdate: () => void
): Marble {
    // Create marble mesh
    const marbleGeometry = new THREE.SphereGeometry(MARBLE_RADIUS, 16, 16);
    const marbleMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
        metalness: 0.8,
        roughness: 0.2
    });
    const marbleMesh = new THREE.Mesh(marbleGeometry, marbleMaterial);
    marbleMesh.castShadow = true;
    marbleMesh.receiveShadow = true;
    marbleMesh.position.copy(launcherPosition);
    scene.add(marbleMesh);

    // Create marble physics body
    const marbleBody = new CANNON.Body({
        mass: 0.1,
        shape: new CANNON.Sphere(MARBLE_RADIUS),
        material: new CANNON.Material({ friction: 0.3, restitution: 0.6 })
    });
    marbleBody.position.set(launcherPosition.x, launcherPosition.y, launcherPosition.z);
    world.addBody(marbleBody);

    // Launch direction (up and left, towards the board center)
    const launchDirection = new CANNON.Vec3(-0.5, 0.6, 0.6).unit();
    marbleBody.velocity = launchDirection.scale(LAUNCHER_POWER);

    // Track marble
    const marble: Marble = {
        mesh: marbleMesh,
        body: marbleBody,
        scored: false
    };

    // Set up collision detection for scoring holes
    scoringHoles.forEach(hole => {
        marbleBody.addEventListener('collide', (e: any) => {
            if (!marble.scored && e.target === hole.body) {
                marble.scored = true;
                setTimeout(() => {
                    scene.remove(marbleMesh);
                    world.removeBody(marbleBody);
                }, 100);
            }
        });
    });

    // Check distance to holes in update loop (more reliable)
    const checkHoleCollisions = () => {
        if (marble.scored) return;

        scoringHoles.forEach(hole => {
            const holePos = new CANNON.Vec3(hole.position.x, hole.position.y, hole.position.z);
            const distance = marbleBody.position.distanceTo(holePos);
            if (distance < 0.5) {
                marble.scored = true;
                marble.pointsEarned = hole.points;
                onScoreUpdate();

                // Remove marble after a short delay
                setTimeout(() => {
                    scene.remove(marbleMesh);
                    world.removeBody(marbleBody);
                }, 100);
            }
        });
    };

    marble.checkHoles = checkHoleCollisions;

    return marble;
}

