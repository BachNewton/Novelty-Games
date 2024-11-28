import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameWorldObjectCreator } from "../../GameWorldObject";
import PlayerTexture from '../textures/player.png';
import PlayerNormalMap from '../textures/player-normal-map.png';
import { OrbitControls } from 'three/examples/jsm/Addons';
import { temporaryExperimentalProperties } from './MarbleWorld';

const WORLD_DOWN = new CANNON.Vec3(0, -1, 0);
const PLAYER_SPEED = 0.7;
// const JUMP_VELOCITY = 7.5;
const PLAYER_AIR_SPEED = 0.0025;
const STEEPNESS_THRESHOLD = 0.7;
const JUMP_COOLDOWN = 200;

interface Player {
    jump(): void;
    reset(position: THREE.Vector3, orbitControls: OrbitControls): void;
    add(scene: THREE.Scene, world: CANNON.World): void;
    update(deltaTime: number, contacts: CANNON.ContactEquation[], isJumpButtonHeld: boolean): void;
}

interface PlayerCreator {
    create(intendedDirection: THREE.Vector3, physicalMaterial: CANNON.Material): Player;
}

export const PlayerCreator: PlayerCreator = {
    create: (intendedDirection, physicalMaterial) => {
        const player = GameWorldObjectCreator.create({
            dimensions: {
                type: 'sphere',
                radius: 0.5
            },
            visualMaterial: {
                type: 'texturePath',
                texturePath: PlayerTexture,
                normalMapPath: PlayerNormalMap
            },
            physicalMaterial: physicalMaterial,
            mass: 1
        });

        const contactNormal = new CANNON.Vec3();

        let playerCanJump = false;
        let lastJumpTime = 0;

        const bodyIntendedDirection = new CANNON.Vec3();
        const torque = new CANNON.Vec3();

        const jump = () => {
            if (!playerCanJump) return;

            playerCanJump = false;
            lastJumpTime = performance.now();

            player.body.velocity.addScaledVector(
                temporaryExperimentalProperties.jumpHeight,
                contactNormal,
                player.body.velocity
            );
        };

        return {
            update: (deltaTime, contacts, isJumpButtonHeld) => {
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
                            contact.ni.negate(contactNormal);
                            break;
                        }
                    }
                }

                if (playerCanJump) {
                    if (isJumpButtonHeld) {
                        jump();
                    }
                } else {
                    player.body.velocity.addScaledVector(
                        deltaTime * PLAYER_AIR_SPEED,
                        bodyIntendedDirection,
                        player.body.velocity
                    );
                }

                player.update();
            },
            add: (scene, world) => {
                scene.add(player.mesh);
                world.addBody(player.body);
            },
            reset: (position, orbitControls) => {
                player.body.position.set(position.x, position.y, position.z);
                player.body.velocity.setZero();
                player.body.angularVelocity.setZero();
                orbitControls.target = player.mesh.position;
                orbitControls.reset();
            },
            jump: jump
        };
    }
};
