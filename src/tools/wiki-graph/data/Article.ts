import * as THREE from 'three';

export interface WikiArticle {
    title: string;       // Exactly as Wikipedia returns it
    categories: string[];
    links: string[];
    depth: number;
    aliases?: string[];  // Redirect source titles that point to this article
    missing?: boolean;   // True if Wikipedia API didn't return this article
}

export interface ArticleNode {
    article: WikiArticle;
    mesh: THREE.Mesh;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
}

export interface ArticleLink {
    source: string;
    target: string;
    line: THREE.Mesh;
}

export interface CrawlState {
    articles: Map<string, WikiArticle>;
    pendingQueue: string[];
    currentDepth: number;
    isRunning: boolean;
    activeRequests: number;
}
