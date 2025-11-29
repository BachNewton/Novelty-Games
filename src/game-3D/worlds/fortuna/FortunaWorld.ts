import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameWorld, GameWorldCreator } from "../GameWorld";
import { OrbitControls } from 'three/examples/jsm/Addons';
import { updateRoute, Route } from '../../../ui/Routing';
import { keyboardInputCreator, Key } from '../../input/Keyboard';

interface Marble {
    mesh: THREE.Mesh;
    body: CANNON.Body;
    scored: boolean;
}

interface ScoringHole {
    position: THREE.Vector3;
    points: number;
    body: CANNON.Body;
    mesh: THREE.Mesh;
}

const MARBLE_RADIUS = 0.15;
const PIN_RADIUS = 0.05;
const PIN_HEIGHT = 0.3;
const LAUNCHER_POWER = 15;
const TOTAL_MARBLES = 10;

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
    const boardBody = addGameBoard(scene, world, scoringHoles);

    // Create launcher position (right side, bottom) - shoot up the right side
    const launcherPosition = new THREE.Vector3(4.2, 2.3, -6.5);
    addLauncher(scene, launcherPosition);

    // Input handling
    const keyboardInput = keyboardInputCreator.create((key: Key) => {
        if (key === Key.SPACE && marblesLaunched < TOTAL_MARBLES) {
            launchMarble(scene, world, launcherPosition, boardBody, marbles, scoringHoles, () => {
                // Callback to update score
                score = marbles.reduce((sum, m) => {
                    return sum + ((m as any).pointsEarned || 0);
                }, 0);
            });
            marblesLaunched++;
        }
    });

    // Update HUD
    const updateScoreDisplay = () => {
        score = marbles.reduce((sum, m) => {
            return sum + ((m as any).pointsEarned || 0);
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
                    if (!marble.scored && (marble as any).checkHoles) {
                        (marble as any).checkHoles();
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

function addGameBoard(scene: THREE.Scene, world: CANNON.World, scoringHoles: ScoringHole[]): CANNON.Body {
    // Create the main game board (slanted surface)
    const boardGeometry = new THREE.BoxGeometry(10, 0.2, 15);
    const boardMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C }); // Tan wood color
    const board = new THREE.Mesh(boardGeometry, boardMaterial);

    // Rotate board to create a slanted surface
    board.rotation.x = -Math.PI / 6; // 30 degree angle
    board.position.set(0, 2, 0);
    board.castShadow = true;
    board.receiveShadow = true;

    scene.add(board);

    // Add physics body for the board
    const boardShape = new CANNON.Box(new CANNON.Vec3(5, 0.1, 7.5));
    const boardBody = new CANNON.Body({ mass: 0 });
    boardBody.addShape(boardShape);
    boardBody.position.set(0, 2, 0);
    boardBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 6);
    world.addBody(boardBody);

    // Create scoring holes based on typical Fortuna layout
    const holeData = [
        { x: -3.5, z: 6, points: 10 },
        { x: -2, z: 6, points: 20 },
        { x: 0, z: 6, points: 25 },
        { x: 2, z: 6, points: 20 },
        { x: 3.5, z: 6, points: 10 },
        { x: -3, z: 4, points: 25 },
        { x: -1.5, z: 4, points: 50 },
        { x: 0, z: 4, points: 75 },
        { x: 1.5, z: 4, points: 50 },
        { x: 3, z: 4, points: 25 },
        { x: -2.5, z: 2, points: 75 },
        { x: -1, z: 2, points: 100 },
        { x: 0.5, z: 2, points: 125 },
        { x: 2, z: 2, points: 100 },
        { x: 3.5, z: 2, points: 75 },
        { x: -1.5, z: 0, points: 125 },
        { x: 0, z: 0, points: 150 },
        { x: 1.5, z: 0, points: 125 },
    ];

    const boardAngle = -Math.PI / 6;
    const boardCenterY = 2;
    const boardThickness = 0.2;
    const boardSurfaceOffset = boardThickness / 2; // Surface is at +0.1 in local Y

    holeData.forEach(({ x, z, points }) => {
        // Transform point from board-local coordinates to world coordinates
        // For a point on the board surface at local (x, 0.1, z):
        const localY = boardSurfaceOffset;

        // Apply rotation around X axis: y' = y*cos - z*sin, z' = y*sin + z*cos
        const cosAngle = Math.cos(boardAngle);
        const sinAngle = Math.sin(boardAngle);
        const worldY = boardCenterY + localY * cosAngle - z * sinAngle;
        const worldZ = localY * sinAngle + z * cosAngle;

        const holePosition = new THREE.Vector3(x, worldY, worldZ);
        const hole = createScoringHole(scene, world, holePosition, points, boardAngle);
        scoringHoles.push(hole);
    });

    // Add pins in patterns across the board
    addPins(scene, world, boardBody);

    // Create side walls to keep balls on the board
    const wallHeight = 0.5;
    const wallThickness = 0.1;

    // Left wall
    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, 15),
        new THREE.MeshStandardMaterial({ color: 0xFF4500 }) // Orange/red frame
    );
    leftWall.position.set(-5, 2.1, 0);
    scene.add(leftWall);

    // Add physics for left wall
    const leftWallBody = new CANNON.Body({ mass: 0 });
    leftWallBody.addShape(new CANNON.Box(new CANNON.Vec3(wallThickness / 2, wallHeight / 2, 7.5)));
    leftWallBody.position.set(-5, 2.1, 0);
    world.addBody(leftWallBody);

    // Right wall
    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, 15),
        new THREE.MeshStandardMaterial({ color: 0xFF4500 })
    );
    rightWall.position.set(5, 2.1, 0);
    scene.add(rightWall);

    // Add physics for right wall
    const rightWallBody = new CANNON.Body({ mass: 0 });
    rightWallBody.addShape(new CANNON.Box(new CANNON.Vec3(wallThickness / 2, wallHeight / 2, 7.5)));
    rightWallBody.position.set(5, 2.1, 0);
    world.addBody(rightWallBody);

    // Top wall (rounded area)
    const topWall = new THREE.Mesh(
        new THREE.BoxGeometry(10, wallHeight, wallThickness),
        new THREE.MeshStandardMaterial({ color: 0xFF4500 })
    );
    topWall.position.set(0, 2.1, 7.5);
    scene.add(topWall);

    // Add physics for top wall
    const topWallBody = new CANNON.Body({ mass: 0 });
    topWallBody.addShape(new CANNON.Box(new CANNON.Vec3(5, wallHeight / 2, wallThickness / 2)));
    topWallBody.position.set(0, 2.1, 7.5);
    world.addBody(topWallBody);

    // Bottom wall (catch area)
    const bottomWall = new THREE.Mesh(
        new THREE.BoxGeometry(10, wallHeight, wallThickness),
        new THREE.MeshStandardMaterial({ color: 0xFF4500 })
    );
    bottomWall.position.set(0, 2.1, -7.5);
    scene.add(bottomWall);

    // Add physics for bottom wall
    const bottomWallBody = new CANNON.Body({ mass: 0 });
    bottomWallBody.addShape(new CANNON.Box(new CANNON.Vec3(5, wallHeight / 2, wallThickness / 2)));
    bottomWallBody.position.set(0, 2.1, -7.5);
    world.addBody(bottomWallBody);

    return boardBody;
}

function addPins(scene: THREE.Scene, world: CANNON.World, boardBody: CANNON.Body) {
    const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 }); // Silver
    const pinGeometry = new THREE.CylinderGeometry(PIN_RADIUS, PIN_RADIUS, PIN_HEIGHT, 8);

    // Create pin positions in patterns (V shapes and scattered)
    const pinPositions: { x: number; z: number }[] = [];

    // Top V patterns
    for (let i = 0; i < 3; i++) {
        pinPositions.push({ x: -2 + i * 2, z: 5.5 });
        pinPositions.push({ x: -1 + i * 2, z: 5 });
    }

    // Middle V patterns
    for (let i = 0; i < 4; i++) {
        pinPositions.push({ x: -3 + i * 2, z: 3.5 });
        pinPositions.push({ x: -2.5 + i * 2, z: 3 });
        pinPositions.push({ x: -1.5 + i * 2, z: 3 });
    }

    // Lower scattered pins
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
            pinPositions.push({ x: -4 + i * 2, z: 1 + j * 0.8 });
        }
    }

    // Add more scattered pins
    for (let i = 0; i < 8; i++) {
        pinPositions.push({ x: -3.5 + Math.random() * 7, z: -2 + Math.random() * 4 });
    }

    const boardAngle = -Math.PI / 6;
    const boardCenterY = 2;
    const boardThickness = 0.2;
    const boardSurfaceOffset = boardThickness / 2; // Surface is at +0.1 in local Y

    pinPositions.forEach(({ x, z }) => {
        // Transform point from board-local coordinates to world coordinates
        // Board is at (0, 2, 0) and rotated -30° around X axis
        // For a point on the board surface at local (x, 0.1, z):
        const localY = boardSurfaceOffset;

        // Apply rotation around X axis: y' = y*cos - z*sin, z' = y*sin + z*cos
        const cosAngle = Math.cos(boardAngle);
        const sinAngle = Math.sin(boardAngle);
        const worldY = boardCenterY + localY * cosAngle - z * sinAngle;
        const worldZ = localY * sinAngle + z * cosAngle;

        // Pin base should be on the surface, center is at half height above surface
        const pinCenterY = worldY + (PIN_HEIGHT / 2) * cosAngle;
        const pinCenterZ = worldZ - (PIN_HEIGHT / 2) * sinAngle;

        const pin = new THREE.Mesh(pinGeometry, pinMaterial);
        pin.position.set(x, pinCenterY, pinCenterZ);
        // Rotate pin to be perpendicular to board (same rotation as board)
        pin.rotation.x = boardAngle;
        pin.castShadow = true;
        scene.add(pin);

        // Add physics body for pin - must match visual rotation
        const pinBody = new CANNON.Body({ mass: 0 });
        pinBody.addShape(new CANNON.Cylinder(PIN_RADIUS, PIN_RADIUS, PIN_HEIGHT, 8));
        pinBody.position.set(x, pinCenterY, pinCenterZ);
        // Rotate physics body to match visual
        pinBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), boardAngle);
        world.addBody(pinBody);
    });
}

function createScoringHole(scene: THREE.Scene, world: CANNON.World, position: THREE.Vector3, points: number, boardAngle: number): ScoringHole {
    // Visual hole - rotated to align with board surface
    const holeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
    const holeMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 }); // Red
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    hole.position.copy(position);
    // Rotate hole to be flush with board surface (cylinder axis should be perpendicular to board)
    // Cylinder default axis is Y, we want it perpendicular to board, so rotate by boardAngle + 90°
    hole.rotation.x = Math.PI / 2 + boardAngle;
    scene.add(hole);

    // Add text label for points
    // For now, we'll just use the hole color to indicate scoring

    // Physics body for detection (invisible trigger)
    const holeBody = new CANNON.Body({
        mass: 0,
        isTrigger: true,
        collisionResponse: false
    });
    holeBody.addShape(new CANNON.Cylinder(0.4, 0.4, 0.2, 8));
    holeBody.position.set(position.x, position.y, position.z);
    // Rotate physics body to match visual rotation
    holeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2 + boardAngle);
    world.addBody(holeBody);

    return {
        position: position.clone(),
        points: points,
        body: holeBody,
        mesh: hole
    };
}

function launchMarble(
    scene: THREE.Scene,
    world: CANNON.World,
    launcherPosition: THREE.Vector3,
    boardBody: CANNON.Body,
    marbles: Marble[],
    scoringHoles: ScoringHole[],
    onScoreUpdate: () => void
): void {
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
    marbles.push(marble);

    // Set up collision detection for scoring holes
    scoringHoles.forEach(hole => {
        marbleBody.addEventListener('collide', (e: any) => {
            if (!marble.scored && e.target === hole.body) {
                marble.scored = true;
                // Add points (we'll track this in the main update function)
                // For now, mark the marble as scored
                setTimeout(() => {
                    scene.remove(marbleMesh);
                    world.removeBody(marbleBody);
                }, 100);
            }
        });
    });

    // Also check distance to holes in update loop (more reliable)
    const checkHoleCollisions = () => {
        if (marble.scored) return;

        scoringHoles.forEach(hole => {
            const holePos = new CANNON.Vec3(hole.position.x, hole.position.y, hole.position.z);
            const distance = marbleBody.position.distanceTo(holePos);
            if (distance < 0.5) {
                marble.scored = true;
                // Score points
                (marble as any).pointsEarned = hole.points;
                onScoreUpdate();

                // Remove marble after a short delay
                setTimeout(() => {
                    scene.remove(marbleMesh);
                    world.removeBody(marbleBody);
                }, 100);
            }
        });
    };

    // Store check function on marble
    (marble as any).checkHoles = checkHoleCollisions;
}

function addLauncher(scene: THREE.Scene, position: THREE.Vector3) {
    // Launcher visual (wooden stick/channel on right side)
    const launcherGeometry = new THREE.BoxGeometry(0.2, 0.15, 1.5);
    const launcherMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown wood
    const launcher = new THREE.Mesh(launcherGeometry, launcherMaterial);
    launcher.position.copy(position);
    launcher.rotation.z = Math.PI / 6; // Angle the launcher
    scene.add(launcher);

    // Launcher channel/guide
    const channelGeometry = new THREE.BoxGeometry(0.3, 0.05, 1.5);
    const channelMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 }); // Darker brown
    const channel = new THREE.Mesh(channelGeometry, channelMaterial);
    channel.position.copy(position);
    channel.position.y -= 0.1;
    channel.rotation.z = Math.PI / 6;
    scene.add(channel);
}

function addGround(scene: THREE.Scene) {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshPhongMaterial({ color: 0x999999 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(50, 50);
    scene.add(grid);
}

function addLight(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
}

function createOrbitControls(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLCanvasElement): OrbitControls {
    const controls = new OrbitControls(camera, rendererDomElement);
    controls.object.position.set(0, 8, 12);
    controls.target.set(0, 2, 0);
    controls.update();
    return controls;
}

function addSkybox(scene: THREE.Scene) {
    scene.background = new THREE.Color('lightblue');
}
