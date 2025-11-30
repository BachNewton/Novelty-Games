import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { ScoringHole, PIN_RADIUS, PIN_HEIGHT, BOARD_ANGLE, BOARD_CENTER_Y, BOARD_THICKNESS } from './types';

export function createBoard(scene: THREE.Scene, world: CANNON.World, scoringHoles: ScoringHole[]): CANNON.Body {
    // Create the main game board (slanted surface)
    const boardGeometry = new THREE.BoxGeometry(10, BOARD_THICKNESS, 15);
    const boardMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C }); // Tan wood color
    const board = new THREE.Mesh(boardGeometry, boardMaterial);

    // Rotate board to create a slanted surface
    board.rotation.x = BOARD_ANGLE;
    board.position.set(0, BOARD_CENTER_Y, 0);
    board.castShadow = true;
    board.receiveShadow = true;

    scene.add(board);

    // Add physics body for the board
    const boardShape = new CANNON.Box(new CANNON.Vec3(5, BOARD_THICKNESS / 2, 7.5));
    const boardBody = new CANNON.Body({ mass: 0 });
    boardBody.addShape(boardShape);
    boardBody.position.set(0, BOARD_CENTER_Y, 0);
    boardBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), BOARD_ANGLE);
    world.addBody(boardBody);

    // Create scoring holes
    createScoringHoles(scene, world, scoringHoles);

    // Add pins in patterns across the board
    createPins(scene, world);

    // Create side walls to keep balls on the board
    createWalls(scene, world);

    return boardBody;
}

function createScoringHoles(scene: THREE.Scene, world: CANNON.World, scoringHoles: ScoringHole[]) {
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

    const boardSurfaceOffset = BOARD_THICKNESS / 2; // Surface is at +0.1 in local Y

    holeData.forEach(({ x, z, points }) => {
        // Transform point from board-local coordinates to world coordinates
        const localY = boardSurfaceOffset;

        // Apply rotation around X axis: y' = y*cos - z*sin, z' = y*sin + z*cos
        const cosAngle = Math.cos(BOARD_ANGLE);
        const sinAngle = Math.sin(BOARD_ANGLE);
        const worldY = BOARD_CENTER_Y + localY * cosAngle - z * sinAngle;
        const worldZ = localY * sinAngle + z * cosAngle;

        const holePosition = new THREE.Vector3(x, worldY, worldZ);
        const hole = createScoringHole(scene, world, holePosition, points);
        scoringHoles.push(hole);
    });
}

function createScoringHole(scene: THREE.Scene, world: CANNON.World, position: THREE.Vector3, points: number): ScoringHole {
    // Visual hole - rotated to align with board surface
    const holeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
    const holeMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 }); // Red
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    hole.position.copy(position);
    // Rotate hole to be flush with board surface
    hole.rotation.x = Math.PI / 2 + BOARD_ANGLE;
    scene.add(hole);

    // Physics body for detection (invisible trigger)
    const holeBody = new CANNON.Body({
        mass: 0,
        isTrigger: true,
        collisionResponse: false
    });
    holeBody.addShape(new CANNON.Cylinder(0.4, 0.4, 0.2, 8));
    holeBody.position.set(position.x, position.y, position.z);
    holeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2 + BOARD_ANGLE);
    world.addBody(holeBody);

    return {
        position: position.clone(),
        points: points,
        body: holeBody,
        mesh: hole
    };
}

function createPins(scene: THREE.Scene, world: CANNON.World) {
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

    const boardSurfaceOffset = BOARD_THICKNESS / 2;

    pinPositions.forEach(({ x, z }) => {
        // Transform point from board-local coordinates to world coordinates
        const localY = boardSurfaceOffset;

        // Apply rotation around X axis: y' = y*cos - z*sin, z' = y*sin + z*cos
        const cosAngle = Math.cos(BOARD_ANGLE);
        const sinAngle = Math.sin(BOARD_ANGLE);
        const worldY = BOARD_CENTER_Y + localY * cosAngle - z * sinAngle;
        const worldZ = localY * sinAngle + z * cosAngle;

        // Pin base should be on the surface, center is at half height above surface
        const pinCenterY = worldY + (PIN_HEIGHT / 2) * cosAngle;
        const pinCenterZ = worldZ - (PIN_HEIGHT / 2) * sinAngle;

        const pin = new THREE.Mesh(pinGeometry, pinMaterial);
        pin.position.set(x, pinCenterY, pinCenterZ);
        pin.rotation.x = BOARD_ANGLE;
        pin.castShadow = true;
        scene.add(pin);

        // Add physics body for pin
        const pinBody = new CANNON.Body({ mass: 0 });
        pinBody.addShape(new CANNON.Cylinder(PIN_RADIUS, PIN_RADIUS, PIN_HEIGHT, 8));
        pinBody.position.set(x, pinCenterY, pinCenterZ);
        pinBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), BOARD_ANGLE);
        world.addBody(pinBody);
    });
}

function createWalls(scene: THREE.Scene, world: CANNON.World) {
    const wallHeight = 0.5;
    const wallThickness = 0.1;
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xFF4500 }); // Orange/red frame

    // Left wall
    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, 15),
        wallMaterial
    );
    leftWall.position.set(-5, 2.1, 0);
    scene.add(leftWall);

    const leftWallBody = new CANNON.Body({ mass: 0 });
    leftWallBody.addShape(new CANNON.Box(new CANNON.Vec3(wallThickness / 2, wallHeight / 2, 7.5)));
    leftWallBody.position.set(-5, 2.1, 0);
    world.addBody(leftWallBody);

    // Right wall
    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, 15),
        wallMaterial
    );
    rightWall.position.set(5, 2.1, 0);
    scene.add(rightWall);

    const rightWallBody = new CANNON.Body({ mass: 0 });
    rightWallBody.addShape(new CANNON.Box(new CANNON.Vec3(wallThickness / 2, wallHeight / 2, 7.5)));
    rightWallBody.position.set(5, 2.1, 0);
    world.addBody(rightWallBody);

    // Top wall
    const topWall = new THREE.Mesh(
        new THREE.BoxGeometry(10, wallHeight, wallThickness),
        wallMaterial
    );
    topWall.position.set(0, 2.1, 7.5);
    scene.add(topWall);

    const topWallBody = new CANNON.Body({ mass: 0 });
    topWallBody.addShape(new CANNON.Box(new CANNON.Vec3(5, wallHeight / 2, wallThickness / 2)));
    topWallBody.position.set(0, 2.1, 7.5);
    world.addBody(topWallBody);

    // Bottom wall
    const bottomWall = new THREE.Mesh(
        new THREE.BoxGeometry(10, wallHeight, wallThickness),
        wallMaterial
    );
    bottomWall.position.set(0, 2.1, -7.5);
    scene.add(bottomWall);

    const bottomWallBody = new CANNON.Body({ mass: 0 });
    bottomWallBody.addShape(new CANNON.Box(new CANNON.Vec3(5, wallHeight / 2, wallThickness / 2)));
    bottomWallBody.position.set(0, 2.1, -7.5);
    world.addBody(bottomWallBody);
}

