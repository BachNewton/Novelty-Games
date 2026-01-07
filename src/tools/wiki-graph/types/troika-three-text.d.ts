declare module 'troika-three-text' {
    import { Mesh, Color } from 'three';

    export class Text extends Mesh {
        text: string;
        fontSize: number;
        color: string | number | Color;
        anchorX: 'left' | 'center' | 'right' | number;
        anchorY: 'top' | 'top-baseline' | 'middle' | 'bottom-baseline' | 'bottom' | number;
        outlineWidth: number | string;
        outlineColor: string | number | Color;
        fillOpacity: number;
        outlineOpacity: number;
        sync: (callback?: () => void) => void;
        dispose: () => void;
    }
}
