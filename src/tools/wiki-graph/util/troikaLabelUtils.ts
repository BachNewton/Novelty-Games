import { Text } from 'troika-three-text';
import { LABEL_CONFIG } from '../config/labelConfig';

export function createTroikaLabel(
    title: string,
    isLeaf: boolean,
    isMissing: boolean
): Text {
    const text = new Text();
    text.text = title;
    text.fontSize = 0.3;
    text.color = isMissing
        ? LABEL_CONFIG.colors.missing
        : isLeaf
        ? LABEL_CONFIG.colors.leaf
        : LABEL_CONFIG.colors.normal;
    text.anchorX = 'center';
    text.anchorY = 'bottom';
    text.outlineWidth = 0.02;
    text.outlineColor = 0x000000;

    // Sync to generate geometry
    text.sync();

    return text;
}
