import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';

export interface WikiArticle {
    title: string;
    description: string;
    categories: string[];
    links: string[];
    depth: number;
    aliases?: string[];  // Redirect source titles that point to this article
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
    line: Line2;
}

export interface CrawlState {
    articles: Map<string, WikiArticle>;
    pendingQueue: string[];
    priorityQueue: string[];
    currentDepth: number;
    isRunning: boolean;
    activeRequests: number;
}
