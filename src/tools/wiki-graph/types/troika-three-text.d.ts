declare module 'troika-three-text' {
    import { Mesh, Color } from 'three';

    export interface TextBuilderConfig {
        useWorker?: boolean;
        unicodeFontsURL?: string;
    }

    export function configureTextBuilder(config: TextBuilderConfig): void;

    export class Text extends Mesh {
        text: string;
        font: string | null;
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
