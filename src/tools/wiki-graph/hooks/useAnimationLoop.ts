import { useEffect, useRef, RefObject } from 'react';
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { SceneManager } from '../scene/SceneManager';
import { ForceSimulation } from '../logic/ForceSimulation';
import { CameraAnimator } from '../logic/CameraAnimator';
import { ArticleNode, ArticleLink } from '../data/Article';
import { NodeFactory, LoadingIndicator } from '../scene/NodeFactory';
import { InstancedNodeManager } from '../scene/InstancedNodeManager';
import { InstancedLinkManager } from '../scene/InstancedLinkManager';

const MINIMUM_FRAME_RATE = 1000 / 25;

interface AnimationDeps {
    sceneManager: SceneManager | null;
    simulation: ForceSimulation;
    cameraAnimator: CameraAnimator | null;
    nodeFactory: NodeFactory;
    nodeManager: InstancedNodeManager;
    linkManager: InstancedLinkManager;
    articlesRef: RefObject<Map<string, ArticleNode>>;
    linksRef: RefObject<ArticleLink[]>;
    loadingIndicatorsRef: RefObject<Map<string, LoadingIndicator>>;
    statsLabelRef: RefObject<CSS2DObject | null>;
    selectedArticleRef: RefObject<string | null>;
    fogDensity: number;
    baseDistance: number;
    labelScaleFactor: number;
}

// Reusable quaternion for cone orientation
const tempQuaternion = new THREE.Quaternion();
const tempDirection = new THREE.Vector3();
const upVector = new THREE.Vector3(0, 0, -1); // Cone points in -Z

export function useAnimationLoop(deps: AnimationDeps): void {
    const previousTimeRef = useRef(0);

    useEffect(() => {
        const {
            sceneManager, simulation, cameraAnimator, nodeFactory, nodeManager, linkManager,
            articlesRef, linksRef, loadingIndicatorsRef, statsLabelRef, selectedArticleRef,
            fogDensity, baseDistance, labelScaleFactor
        } = deps;

        if (!sceneManager) return;

        const { scene, camera, renderer, labelRenderer, controls, stats } = sceneManager.getComponents();

        // Derive max visible distance from fog formula once (constant for the session)
        // opacity = exp(-d² * fogDensity), solve for d when opacity = minOpacity
        const minOpacity = 0.01;
        const maxDistanceBeyondBase = Math.sqrt(-Math.log(minOpacity) / fogDensity);
        const maxLabelDistance = baseDistance + maxDistanceBeyondBase;

        function updateLabel(label: CSS2DObject, pos: THREE.Vector3, yOffset: number, baseFontSize: number): void {
            const distance = camera.position.distanceTo(pos);

            if (distance < maxLabelDistance) {
                label.position.set(pos.x, pos.y + yOffset, pos.z);
                label.visible = true;

                const scale = (baseDistance / distance) * labelScaleFactor;
                const distanceBeyondBase = Math.max(0, distance - baseDistance);
                const opacity = Math.exp(-distanceBeyondBase * distanceBeyondBase * fogDensity);

                if (label.element) {
                    label.element.style.opacity = String(opacity);
                    label.element.style.fontSize = `${baseFontSize * scale}px`;
                }
            } else {
                label.visible = false;
            }
        }

        function animate(time: DOMHighResTimeStamp) {
            const deltaTime = Math.min(time - previousTimeRef.current, MINIMUM_FRAME_RATE);
            previousTimeRef.current = time;

            simulation.update(deltaTime);

            const articles = articlesRef.current!;
            const links = linksRef.current!;
            const loadingIndicators = loadingIndicatorsRef.current!;

            // Update instanced node positions
            for (const [title, node] of articles) {
                const pos = simulation.getPosition(title);
                if (pos) {
                    node.position.copy(pos);

                    // Update instance position
                    nodeManager.setPosition(node.instanceType, node.instanceIndex, pos);

                    // Update title label with fog/scale effects
                    updateLabel(node.label, pos, 0.75, 11);

                    // Orient cones toward their source node
                    if (node.instanceType === 'cone') {
                        const incomingLink = links.find(l => l.target === title && l.linkType === 'directional');
                        if (incomingLink) {
                            const sourceNode = articles.get(incomingLink.source);
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
                    nodeFactory.rotateIndicator(indicator.ring, deltaTime);
                }
            }

            // Update stats label (link count) for selected article
            const statsLabel = statsLabelRef.current;
            const selectedTitle = selectedArticleRef.current;
            if (statsLabel && selectedTitle) {
                const selectedNode = articles.get(selectedTitle);
                if (selectedNode) {
                    updateLabel(statsLabel, selectedNode.position, 1.25, 9);
                }
            }

            cameraAnimator?.update(deltaTime);
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
            stats.update();
        }

        renderer.setAnimationLoop(animate);

        return () => {
            renderer.setAnimationLoop(null);
        };
    }, [deps]);
}
