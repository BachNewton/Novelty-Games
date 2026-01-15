import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { NodeType } from '../scene/InstancedNodeManager';

export interface WikiArticle {
    title: string;       // Exactly as Wikipedia returns it
    categories: string[];
    links: string[];
    depth: number;
    aliases?: string[];  // Redirect source titles that point to this article
    missing?: boolean;   // True if Wikipedia API didn't return this article
    leaf?: boolean;      // True if this is a leaf node (not yet fetched, just a placeholder)
}

export type LinkType = 'directional' | 'bidirectional';

export interface ArticleNode {
    article: WikiArticle;
    instanceIndex: number;
    instanceType: NodeType;
    label: Text | null;  // null when DEBUG_CONFIG.disableLabels is true
    position: THREE.Vector3;
    velocity: THREE.Vector3;
}

export interface ArticleLink {
    source: string;
    target: string;
    instanceIndex: number;
    linkType: 'directional' | 'bidirectional';
}
