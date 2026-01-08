import { Text } from 'troika-three-text';
import { LABEL_CONFIG } from '../config/labelConfig';
import * as THREE from 'three';
import { DEBUG_CONFIG } from '../config/debugConfig';

function applyCommon(label: Text, scene: THREE.Scene): void {
    label.anchorX = 'center';
    label.anchorY = 'bottom';
    label.outlineColor = LABEL_CONFIG.outline.color;
    label.sync();

    if (DEBUG_CONFIG.disableLabels) return;
    scene.add(label);
}

export function createTitleLabel(
    title: string,
    isLeaf: boolean,
    isMissing: boolean,
    scene: THREE.Scene
): Text {
    const label = new Text();
    label.text = title;
    label.fontSize = LABEL_CONFIG.title.fontSize;
    label.outlineWidth = LABEL_CONFIG.title.outlineWidth;
    label.color = isMissing
        ? LABEL_CONFIG.colors.missing
        : isLeaf
            ? LABEL_CONFIG.colors.leaf
            : LABEL_CONFIG.colors.normal;
    applyCommon(label, scene);
    return label;
}

export function createStatsLabel(text: string, scene: THREE.Scene): Text {
    const label = new Text();
    label.text = text;
    label.fontSize = LABEL_CONFIG.stats.fontSize;
    label.outlineWidth = LABEL_CONFIG.stats.outlineWidth;
    label.color = LABEL_CONFIG.stats.color;
    applyCommon(label, scene);
    return label;
}
