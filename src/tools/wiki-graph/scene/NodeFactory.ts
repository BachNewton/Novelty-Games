import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { WikiArticle } from '../data/Article';

export interface LoadingIndicator {
    ring: THREE.Mesh;
    pending: Set<string>;
}

export interface NodeFactory {
    createNode: (article: WikiArticle, color: number) => THREE.Mesh;
    createLoadingIndicator: () => THREE.Mesh;
    updateLabelForDistance: (mesh: THREE.Mesh, cameraPosition: THREE.Vector3) => void;
    highlightNode: (mesh: THREE.Mesh, highlighted: boolean) => void;
    rotateIndicator: (ring: THREE.Mesh, deltaTime: number) => void;
}

const MISSING_COLOR = 0x666666;  // Grey for missing articles

export function createNodeFactory(): NodeFactory {
    const baseDistance = 30;
    const fogDensity = 0.003;

    return {
        createNode: (article, color) => {
            // Missing articles: grey box. Normal articles: colored sphere
            const isMissing = article.missing === true;
            const geometry = isMissing
                ? new THREE.BoxGeometry(0.5, 0.5, 0.5)
                : new THREE.SphereGeometry(0.4, 16, 16);
            const material = new THREE.MeshStandardMaterial({
                color: isMissing ? MISSING_COLOR : color,
                roughness: 0.5,
                metalness: 0.3
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData = { title: article.title, missing: isMissing };

            const labelDiv = document.createElement('div');
            labelDiv.textContent = article.title;
            labelDiv.style.color = isMissing ? '#999999' : 'white';
            labelDiv.style.fontSize = '12px';
            labelDiv.style.fontFamily = 'sans-serif';
            labelDiv.style.textShadow = '1px 1px 2px black';
            labelDiv.style.whiteSpace = 'nowrap';

            const label = new CSS2DObject(labelDiv);
            label.position.set(0, 0.75, 0);
            mesh.add(label);

            return mesh;
        },

        createLoadingIndicator: () => {
            const ringGeometry = new THREE.TorusGeometry(0.6, 0.05, 8, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x4ECDC4,
                transparent: true,
                opacity: 0.8
            });
            return new THREE.Mesh(ringGeometry, ringMaterial);
        },

        updateLabelForDistance: (mesh, cameraPosition) => {
            const distance = cameraPosition.distanceTo(mesh.position);
            const scale = baseDistance / distance;

            const distanceBeyondBase = Math.max(0, distance - baseDistance);
            const opacity = Math.exp(-distanceBeyondBase * distanceBeyondBase * fogDensity);

            const label = mesh.children[0] as CSS2DObject;
            if (label?.element) {
                label.element.style.opacity = String(opacity);
                label.element.style.transform = `scale(${scale}) translateY(-20px)`;
            }
        },

        highlightNode: (mesh, highlighted) => {
            const material = mesh.material as THREE.MeshStandardMaterial;
            if (highlighted) {
                material.emissive.setHex(0x333333);
                mesh.scale.setScalar(1.3);
            } else {
                material.emissive.setHex(0x000000);
                mesh.scale.setScalar(1);
            }
        },

        rotateIndicator: (ring, deltaTime) => {
            ring.rotation.x += deltaTime * 0.002;
            ring.rotation.y += deltaTime * 0.003;
        }
    };
}
