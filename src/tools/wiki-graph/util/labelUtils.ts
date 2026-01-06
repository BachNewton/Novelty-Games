import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { LABEL_CONFIG } from '../config/labelConfig';

export function createNodeLabel(
    title: string,
    isLeaf: boolean,
    isMissing: boolean
): CSS2DObject {
    const labelDiv = document.createElement('div');
    labelDiv.textContent = title;
    labelDiv.style.color = isMissing
        ? LABEL_CONFIG.colors.missing
        : isLeaf
        ? LABEL_CONFIG.colors.leaf
        : LABEL_CONFIG.colors.normal;
    labelDiv.style.fontSize = `${LABEL_CONFIG.node.fontSize}px`;
    labelDiv.style.fontFamily = LABEL_CONFIG.style.fontFamily;
    labelDiv.style.textShadow = LABEL_CONFIG.style.textShadow;
    labelDiv.style.whiteSpace = 'nowrap';

    const label = new CSS2DObject(labelDiv);
    label.position.set(0, LABEL_CONFIG.node.yOffset, 0);
    return label;
}
