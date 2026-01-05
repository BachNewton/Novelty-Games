import { useEffect, useRef, RefObject } from 'react';
import * as THREE from 'three';
import { SceneManager } from '../scene/SceneManager';
import { InstancedNodeManager, NodeType } from '../scene/InstancedNodeManager';
import { ArticleNode } from '../data/Article';

interface MouseInteractionDeps {
    sceneManager: SceneManager | null;
    nodeManager: InstancedNodeManager;
    articlesRef: RefObject<Map<string, ArticleNode>>;
    onArticleClick: (title: string) => void;
}

function updateMouseFromEvent(event: MouseEvent | PointerEvent, mouse: THREE.Vector2, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

export function useMouseInteraction(deps: MouseInteractionDeps): void {
    const hoveredTitleRef = useRef<string | null>(null);

    useEffect(() => {
        const { sceneManager, nodeManager, articlesRef, onArticleClick } = deps;

        if (!sceneManager) return;

        const { camera, renderer, raycaster, mouse } = sceneManager.getComponents();

        // Get instanced meshes for raycasting
        const instancedMeshes = nodeManager.getMeshes().filter(
            obj => obj instanceof THREE.InstancedMesh
        ) as THREE.InstancedMesh[];

        // Find article by instanceType and instanceIndex
        function findArticleByInstance(mesh: THREE.InstancedMesh, instanceId: number): string | null {
            // Determine node type from mesh geometry
            let nodeType: NodeType;
            if (mesh.geometry instanceof THREE.SphereGeometry) {
                nodeType = 'sphere';
            } else if (mesh.geometry instanceof THREE.BoxGeometry) {
                nodeType = 'box';
            } else {
                nodeType = 'cone';
            }

            // Linear search through articles to find matching instance
            for (const [title, node] of articlesRef.current!) {
                if (node.instanceType === nodeType && node.instanceIndex === instanceId) {
                    return title;
                }
            }
            return null;
        }

        function onPointerDown(event: PointerEvent) {
            updateMouseFromEvent(event, mouse, renderer.domElement);
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(instancedMeshes, false);

            if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
                const mesh = intersects[0].object as THREE.InstancedMesh;
                const title = findArticleByInstance(mesh, intersects[0].instanceId);
                if (title) {
                    onArticleClick(title);
                }
            }
        }

        function onMouseMove(event: MouseEvent) {
            updateMouseFromEvent(event, mouse, renderer.domElement);
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(instancedMeshes, false);

            // Clear previous highlight
            if (hoveredTitleRef.current) {
                nodeManager.clearHighlight();
                hoveredTitleRef.current = null;
            }

            // Set new highlight
            if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
                const mesh = intersects[0].object as THREE.InstancedMesh;
                const title = findArticleByInstance(mesh, intersects[0].instanceId);
                if (title) {
                    const node = articlesRef.current!.get(title);
                    if (node) {
                        nodeManager.setHighlighted(node.instanceType, node.instanceIndex, node.position);
                        hoveredTitleRef.current = title;
                        renderer.domElement.style.cursor = 'pointer';
                        return;
                    }
                }
            }
            renderer.domElement.style.cursor = 'default';
        }

        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        renderer.domElement.addEventListener('mousemove', onMouseMove);

        return () => {
            renderer.domElement.removeEventListener('pointerdown', onPointerDown);
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
        };
    }, [deps]);
}
