import { useEffect, useRef, RefObject } from 'react';
import { SceneManager } from '../scene/SceneManager';
import { ForceSimulation } from '../logic/ForceSimulation';
import { CameraAnimator } from '../logic/CameraAnimator';
import { ArticleNode, ArticleLink } from '../data/Article';
import { NodeFactory, LoadingIndicator } from '../scene/NodeFactory';
import { LinkFactory } from '../scene/LinkFactory';

const MINIMUM_FRAME_RATE = 1000 / 25;

interface AnimationDeps {
    sceneManager: SceneManager | null;
    simulation: ForceSimulation;
    cameraAnimator: CameraAnimator | null;
    nodeFactory: NodeFactory;
    linkFactory: LinkFactory;
    articlesRef: RefObject<Map<string, ArticleNode>>;
    linksRef: RefObject<ArticleLink[]>;
    loadingIndicatorsRef: RefObject<Map<string, LoadingIndicator>>;
}

export function useAnimationLoop(deps: AnimationDeps): void {
    const previousTimeRef = useRef(0);

    useEffect(() => {
        const {
            sceneManager, simulation, cameraAnimator, nodeFactory, linkFactory,
            articlesRef, linksRef, loadingIndicatorsRef
        } = deps;

        if (!sceneManager) return;

        const { scene, camera, renderer, labelRenderer, controls, stats } = sceneManager.getComponents();

        function animate(time: DOMHighResTimeStamp) {
            const deltaTime = Math.min(time - previousTimeRef.current, MINIMUM_FRAME_RATE);
            previousTimeRef.current = time;

            simulation.update(deltaTime);

            const articles = articlesRef.current!;
            const links = linksRef.current!;
            const loadingIndicators = loadingIndicatorsRef.current!;

            // Update node positions and labels
            for (const [title, node] of articles) {
                const pos = simulation.getPosition(title);
                if (pos) {
                    node.mesh.position.copy(pos);
                    node.position.copy(pos);
                    nodeFactory.updateLabelForDistance(node.mesh, camera.position);
                }
            }

            // Update link positions
            for (const link of links) {
                const sourceNode = articles.get(link.source);
                const targetNode = articles.get(link.target);
                if (sourceNode && targetNode) {
                    linkFactory.updateLinkPositions(link.line, sourceNode.position, targetNode.position);
                }
            }

            // Rotate loading indicators
            for (const [title, indicator] of loadingIndicators) {
                const node = articles.get(title);
                if (node) {
                    indicator.ring.position.copy(node.position);
                    nodeFactory.rotateIndicator(indicator.ring, deltaTime);
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
