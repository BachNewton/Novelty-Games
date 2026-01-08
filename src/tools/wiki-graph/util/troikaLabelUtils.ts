import { Text } from 'troika-three-text';
import { LABEL_CONFIG } from '../config/labelConfig';

function applyCommonStyle(label: Text): void {
    label.anchorX = 'center';
    label.anchorY = 'bottom';
    label.outlineColor = LABEL_CONFIG.outline.color;
    label.sync();
}

export function createTitleLabel(
    title: string,
    isLeaf: boolean,
    isMissing: boolean
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
    applyCommonStyle(label);
    return label;
}

export function createStatsLabel(text: string): Text {
    const label = new Text();
    label.text = text;
    label.fontSize = LABEL_CONFIG.stats.fontSize;
    label.outlineWidth = LABEL_CONFIG.stats.outlineWidth;
    label.color = LABEL_CONFIG.stats.color;
    applyCommonStyle(label);
    return label;
}
