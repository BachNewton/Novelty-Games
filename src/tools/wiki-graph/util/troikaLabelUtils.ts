import { Text } from 'troika-three-text';
import { LABEL_CONFIG } from '../config/labelConfig';
import * as THREE from 'three';
import { DEBUG_CONFIG } from '../config/debugConfig';

interface LabelOptions {
    text: string;
    fontSize: number;
    outlineWidth: number;
    color: string | number;
    scene: THREE.Scene;
}

function createLabel(options: LabelOptions): Text | null {
    if (DEBUG_CONFIG.disableLabels) return null;

    const label = new Text();
    label.text = options.text;
    label.font = LABEL_CONFIG.font;
    label.fontSize = options.fontSize;
    label.outlineWidth = options.outlineWidth;
    label.color = options.color;
    label.anchorX = 'center';
    label.anchorY = 'bottom';
    label.outlineColor = LABEL_CONFIG.outline.color;
    label.sync();

    options.scene.add(label);
    return label;
}

export function createTitleLabel(
    title: string,
    isLeaf: boolean,
    isMissing: boolean,
    scene: THREE.Scene
): Text | null {
    const color = isMissing
        ? LABEL_CONFIG.colors.missing
        : isLeaf
            ? LABEL_CONFIG.colors.leaf
            : LABEL_CONFIG.colors.normal;

    return createLabel({
        text: title,
        fontSize: LABEL_CONFIG.title.fontSize,
        outlineWidth: LABEL_CONFIG.title.outlineWidth,
        color,
        scene
    });
}

export function createStatsLabel(text: string, scene: THREE.Scene): Text | null {
    return createLabel({
        text,
        fontSize: LABEL_CONFIG.stats.fontSize,
        outlineWidth: LABEL_CONFIG.stats.outlineWidth,
        color: LABEL_CONFIG.stats.color,
        scene
    });
}
