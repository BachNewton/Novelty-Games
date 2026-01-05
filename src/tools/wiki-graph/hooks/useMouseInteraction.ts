import { useEffect, useRef, RefObject } from 'react';
import * as THREE from 'three';
import { SceneManager } from '../scene/SceneManager';
import { NodeFactory } from '../scene/NodeFactory';
import { ArticleNode } from '../data/Article';

interface MouseInteractionDeps {
    sceneManager: SceneManager | null;
    nodeFactory: NodeFactory;
    articlesRef: RefObject<Map<string, ArticleNode>>;
    onArticleClick: (title: string) => void;
}

export function useMouseInteraction(deps: MouseInteractionDeps): void {
    const hoveredMeshRef = useRef<THREE.Mesh | null>(null);

    useEffect(() => {
        const { sceneManager, nodeFactory, articlesRef, onArticleClick } = deps;

        if (!sceneManager) return;

        const { camera, renderer, raycaster, mouse } = sceneManager.getComponents();

        function getMeshes(): THREE.Mesh[] {
            return Array.from(articlesRef.current!.values()).map(n => n.mesh);
        }

        function onPointerDown(event: PointerEvent) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(getMeshes(), false);

            if (intersects.length > 0) {
                const title = intersects[0].object.userData.title as string;
                onArticleClick(title);
            }
        }

        function onMouseMove(event: MouseEvent) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(getMeshes(), false);

            // Reset previous hovered mesh
            if (hoveredMeshRef.current) {
                nodeFactory.highlightNode(hoveredMeshRef.current, false);
                hoveredMeshRef.current = null;
            }

            // Highlight new hovered mesh
            if (intersects.length > 0) {
                const mesh = intersects[0].object as THREE.Mesh;
                nodeFactory.highlightNode(mesh, true);
                hoveredMeshRef.current = mesh;
                renderer.domElement.style.cursor = 'pointer';
            } else {
                renderer.domElement.style.cursor = 'default';
            }
        }

        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        renderer.domElement.addEventListener('mousemove', onMouseMove);

        return () => {
            renderer.domElement.removeEventListener('pointerdown', onPointerDown);
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
        };
    }, [deps]);
}
