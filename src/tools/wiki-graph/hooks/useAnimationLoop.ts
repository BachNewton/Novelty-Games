import { useEffect, useRef, RefObject } from 'react';
import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { SceneManager } from '../scene/SceneManager';
import { ForceSimulation } from '../logic/ForceSimulation';
import { CameraAnimator } from '../logic/CameraAnimator';
import { GraphController } from '../logic/GraphController';
import { rotateIndicator } from '../scene/LoadingIndicatorFactory';
import { InstancedNodeManager } from '../scene/InstancedNodeManager';
import { InstancedLinkManager } from '../scene/InstancedLinkManager';
import { ANIMATION_CONFIG } from '../config/animationConfig';
import { LABEL_CONFIG } from '../config/labelConfig';
import { SCENE_CONFIG } from '../config/sceneConfig';
import { DEBUG_CONFIG } from '../config/debugConfig';

interface AnimationDeps {
    sceneManager: SceneManager | null;
    simulation: ForceSimulation;
    cameraAnimator: CameraAnimator | null;
    nodeManager: InstancedNodeManager;
    linkManager: InstancedLinkManager;
    controller: GraphController | null;
    statsLabelRef: RefObject<Text | null>;
    selectedArticleRef: { current: string | null };
}

// Reusable quaternion for cone orientation
const tempQuaternion = new THREE.Quaternion();
const tempDirection = new THREE.Vector3();
const upVector = new THREE.Vector3(0, 0, -1); // Cone points in -Z

// Label fade constants derived from config
const BASE_DISTANCE = SCENE_CONFIG.camera.defaultDistance;
const FOG_DENSITY = SCENE_CONFIG.fog.density;
const MIN_OPACITY = LABEL_CONFIG.fade.minOpacity;
const MAX_DISTANCE_BEYOND_BASE = Math.sqrt(-Math.log(MIN_OPACITY) / FOG_DENSITY);
const MAX_LABEL_DISTANCE = BASE_DISTANCE + MAX_DISTANCE_BEYOND_BASE;

export function useAnimationLoop(deps: AnimationDeps): void {
    const previousTimeRef = useRef(0);

    useEffect(() => {
        const {
            sceneManager, simulation, cameraAnimator, nodeManager, linkManager,
            controller, statsLabelRef, selectedArticleRef
        } = deps;

        if (!sceneManager || !controller) return;

        // Capture non-null controller for use in nested functions
        const graphController = controller;
        const { scene, camera, renderer, controls, stats } = sceneManager.getComponents();

        function updateTroikaLabel(label: Text, pos: THREE.Vector3, yOffset: number): void {
            if (DEBUG_CONFIG.disableLabels) return;

            const distance = camera.position.distanceTo(pos);

            if (distance < MAX_LABEL_DISTANCE) {
                label.position.set(pos.x, pos.y + yOffset, pos.z);
                label.visible = true;

                // Billboard: face camera
                label.quaternion.copy(camera.quaternion);

                // Fade based on distance
                const distanceBeyondBase = Math.max(0, distance - BASE_DISTANCE);
                const opacity = Math.exp(-distanceBeyondBase * distanceBeyondBase * FOG_DENSITY);
                label.fillOpacity = opacity;
                label.outlineOpacity = opacity;
            } else {
                label.visible = false;
            }
        }

        function animate(time: DOMHighResTimeStamp) {
            const deltaTime = Math.min(time - previousTimeRef.current, ANIMATION_CONFIG.minFrameTimeMs);
            previousTimeRef.current = time;

            simulation.update(deltaTime);

            const articles = graphController.getArticles();
            const links = graphController.getLinks();
            const loadingIndicators = graphController.getLoadingIndicators();

            // Build lookup map for directional links: target -> source (O(n) once, not O(n²))
            const directionalLinkSources = new Map<string, string>();
            for (const link of links) {
                if (link.linkType === 'directional') {
                    directionalLinkSources.set(link.target, link.source);
                }
            }

            // Update instanced node positions
            for (const [title, node] of articles) {
                const pos = simulation.getPosition(title);
                if (pos) {
                    node.position.copy(pos);

                    // Update instance position
                    nodeManager.setPosition(node.instanceType, node.instanceIndex, pos);

                    // Update label position and fade
                    if (node.label) {
                        updateTroikaLabel(node.label, pos, LABEL_CONFIG.title.yOffset);
                    }

                    // Orient cones toward their source node
                    if (node.instanceType === 'cone') {
                        const sourceTitle = directionalLinkSources.get(title);
                        if (sourceTitle) {
                            const sourceNode = articles.get(sourceTitle);
                            if (sourceNode) {
                                // Point from target (this node) toward source
                                tempDirection.subVectors(pos, sourceNode.position).normalize();
                                tempQuaternion.setFromUnitVectors(upVector, tempDirection);
                                nodeManager.setRotation(node.instanceType, node.instanceIndex, tempQuaternion);
                            }
                        }
                    }
                }
            }

            // Sync instanced mesh updates
            nodeManager.sync();

            // Update instanced link transforms
            for (const link of links) {
                const sourceNode = articles.get(link.source);
                const targetNode = articles.get(link.target);
                if (sourceNode && targetNode) {
                    linkManager.updateTransform(link.linkType, link.instanceIndex, sourceNode.position, targetNode.position);
                }
            }

            // Sync link mesh updates
            linkManager.sync();

            // Update loading indicators
            for (const [title, indicator] of loadingIndicators) {
                const node = articles.get(title);
                if (node) {
                    indicator.ring.position.copy(node.position);
                    rotateIndicator(indicator.ring, deltaTime);
                }
            }

            // Update stats label (link count) for selected article
            const statsLabel = statsLabelRef.current;
            const selectedTitle = selectedArticleRef.current;
            if (statsLabel && selectedTitle) {
                const selectedNode = articles.get(selectedTitle);
                if (selectedNode) {
                    updateTroikaLabel(statsLabel, selectedNode.position, LABEL_CONFIG.stats.yOffset);
                }
            }

            cameraAnimator?.update(deltaTime);
            controls.update();
            renderer.render(scene, camera);
            stats.update();
        }

        renderer.setAnimationLoop(animate);

        return () => {
            renderer.setAnimationLoop(null);
        };
    }, [deps]);
}
