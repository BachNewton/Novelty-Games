import { useEffect, useRef, useState, RefObject } from 'react';
import { createSceneManager, SceneManager } from '../scene/SceneManager';
import { ArticleLink } from '../data/Article';

export function useThreeScene(
    containerRef: RefObject<HTMLDivElement | null>,
    linksRef: RefObject<ArticleLink[]>
): { sceneManager: SceneManager | null; isReady: boolean } {
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        const manager = createSceneManager(containerRef.current);
        sceneManagerRef.current = manager;
        setIsReady(true);

        function onWindowResize() {
            manager.handleResize(linksRef.current!);
        }

        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            manager.dispose();
            sceneManagerRef.current = null;
            setIsReady(false);
        };
    }, [containerRef, linksRef]);

    return { sceneManager: sceneManagerRef.current, isReady };
}
