import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameWorldObjectCreator } from "../GameWorldObject";
import PlayerTexture from './textures/player.png';
import PlayerNormalMap from './textures/player-normal-map.png';
import { OrbitControls } from 'three/examples/jsm/Addons';

const WORLD_DOWN = new CANNON.Vec3(0, -1, 0);
const PLAYER_SPEED = 0.7;
const JUMP_VELOCITY = 7.5;
const STEEPNESS_THRESHOLD = 0.7;
const JUMP_COOLDOWN = 200;

interface Player {
    jump(): void;
    reset(orbitControls: OrbitControls): void;
    add(scene: THREE.Scene, world: CANNON.World): void;
    update(deltaTime: number, contacts: CANNON.ContactEquation[]): void;
    updateOrbitControls(orbitControls: OrbitControls): void;
}

interface PlayerCreator {
    create(intendedDirection: THREE.Vector3): Player;
}

export const PlayerCreator: PlayerCreator = {
    create: (intendedDirection) => {
        const player = GameWorldObjectCreator.create({
            dimensions: {
                type: 'sphere',
                radius: 0.5
            },
            material: {
                type: 'texture',
                texturePath: PlayerTexture,
                normalMapPath: PlayerNormalMap
            },
            mass: 1
        });

        player.body.position.y = 2;

        let playerCanJump = false;
        let lastJumpTime = 0;

        const bodyIntendedDirection = new CANNON.Vec3();
        const torque = new CANNON.Vec3();

        return {
            update: (deltaTime, contacts) => {
                bodyIntendedDirection.set(intendedDirection.x, 0, intendedDirection.z);
                bodyIntendedDirection.cross(WORLD_DOWN, torque);
                torque.scale(deltaTime * PLAYER_SPEED, torque);
                player.body.applyTorque(torque);

                playerCanJump = false;
                for (const contact of contacts) {
                    if (contact.bi.id === player.body.id) {
                        const steepness = contact.ni.dot(WORLD_DOWN);

                        if (steepness > STEEPNESS_THRESHOLD && performance.now() - lastJumpTime > JUMP_COOLDOWN) {
                            playerCanJump = true;
                            break;
                        }
                    }
                }

                player.update();
            },
            updateOrbitControls: (orbitControls) => {
                orbitControls.target = player.mesh.position;
            },
            add: (scene, world) => {
                scene.add(player.mesh);
                world.addBody(player.body);
            },
            reset: (orbitControls) => {
                player.body.position.set(0, 2, 0);
                player.body.velocity.setZero();
                player.body.angularVelocity.setZero();
                orbitControls.reset();
            },
            jump: () => {
                if (!playerCanJump) return;

                playerCanJump = false;
                lastJumpTime = performance.now();
                player.body.velocity.y = JUMP_VELOCITY;
            }
        };
    }
};
