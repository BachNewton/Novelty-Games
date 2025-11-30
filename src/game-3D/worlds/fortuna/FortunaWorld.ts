import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameWorld, GameWorldCreator } from "../GameWorld";
import { updateRoute, Route } from '../../../ui/Routing';
import { keyboardInputCreator, Key } from '../../input/Keyboard';
import { Marble, ScoringHole, TOTAL_MARBLES } from './types';
import { createBoard } from './Board';
import { createMarble } from './Marble';
import { createLauncher } from './Launcher';
import { addLight, addSkybox, addGround, createOrbitControls } from './Environment';

export const FortunaWorld: GameWorldCreator = {
    create: (scene, camera, world, domElement, updateHUD, updateSummary) => createFortunaWorld(scene, camera, world, domElement, updateHUD, updateSummary)
};

function createFortunaWorld(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    world: CANNON.World,
    domElement: HTMLCanvasElement,
    updateHUD: (text: string) => void,
    updateSummary: (element: JSX.Element) => void
): GameWorld {
    updateRoute(Route.FORTUNA_GAME);

    addLight(scene);
    addSkybox(scene);
    addGround(scene);

    // Game state
    let score = 0;
    let marblesLaunched = 0;
    let marbles: Marble[] = [];
    const scoringHoles: ScoringHole[] = [];

    // Create game board with pins and scoring holes
    const boardBody = createBoard(scene, world, scoringHoles);

    // Create launcher position (right side, bottom) - shoot up the right side
    const launcherPosition = new THREE.Vector3(4.2, 2.3, -6.5);
    createLauncher(scene, launcherPosition);

    // Input handling
    const keyboardInput = keyboardInputCreator.create((key: Key) => {
        if (key === Key.SPACE && marblesLaunched < TOTAL_MARBLES) {
            const marble = createMarble(scene, world, launcherPosition, scoringHoles, () => {
                // Callback to update score
                score = marbles.reduce((sum, m) => {
                    return sum + (m.pointsEarned || 0);
                }, 0);
            });
            marbles.push(marble);
            marblesLaunched++;
        }
    });

    // Update HUD
    const updateScoreDisplay = () => {
        score = marbles.reduce((sum, m) => {
            return sum + (m.pointsEarned || 0);
        }, 0);
        updateHUD(`Score: ${score} | Marbles: ${marblesLaunched}/${TOTAL_MARBLES}`);
    };
    updateScoreDisplay();

    createOrbitControls(camera, domElement);

    return {
        update: (deltaTime) => {
            // Update marble visuals to match physics
            marbles.forEach(marble => {
                if (marble.mesh && marble.body) {
                    marble.mesh.position.copy(marble.body.position);
                    marble.mesh.quaternion.copy(marble.body.quaternion);

                    // Check for hole collisions
                    if (!marble.scored && marble.checkHoles) {
                        marble.checkHoles();
                    }
                }
            });

            // Check for marbles that fell off the board or are too far
            marbles = marbles.filter(marble => {
                if (marble.body.position.y < -5) {
                    // Marble fell off, remove it
                    scene.remove(marble.mesh);
                    world.removeBody(marble.body);
                    return false;
                }
                return true;
            });

            updateScoreDisplay();
        }
    };
}
