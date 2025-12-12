import { FractalType } from '../data/FractalTypes';
import { RenderMode } from './FractalRenderer';

// Vertex shader - simple fullscreen quad
const VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Fragment shader with single precision floats
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_centerReal;
uniform float u_centerImag;
uniform float u_zoom;
uniform int u_maxIterations;
uniform int u_fractalType;
uniform int u_paletteType;
uniform vec2 u_juliaC;

// Fractal types: 0=Mandelbrot, 1=Julia, 2=BurningShip, 3=Tricorn

vec3 getClassicColor(float t) {
    float r = 9.0 * (1.0 - t) * t * t * t;
    float g = 15.0 * (1.0 - t) * (1.0 - t) * t * t;
    float b = 8.5 * (1.0 - t) * (1.0 - t) * (1.0 - t) * t;
    return vec3(r, g, b);
}

vec3 getFireColor(float t) {
    if (t < 0.25) {
        return vec3(t * 4.0, 0.0, 0.0);
    } else if (t < 0.5) {
        float s = (t - 0.25) * 4.0;
        return vec3(1.0, s * 0.65, 0.0);
    } else if (t < 0.75) {
        float s = (t - 0.5) * 4.0;
        return vec3(1.0, 0.65 + s * 0.35, 0.0);
    } else {
        float s = (t - 0.75) * 4.0;
        return vec3(1.0, 1.0, s);
    }
}

vec3 hslToRgb(float h, float s, float l) {
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h / 60.0, 2.0) - 1.0));
    float m = l - c / 2.0;

    vec3 rgb;
    if (h < 60.0) rgb = vec3(c, x, 0.0);
    else if (h < 120.0) rgb = vec3(x, c, 0.0);
    else if (h < 180.0) rgb = vec3(0.0, c, x);
    else if (h < 240.0) rgb = vec3(0.0, x, c);
    else if (h < 300.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);

    return rgb + m;
}

vec3 getRainbowColor(float t) {
    return hslToRgb(t * 360.0, 1.0, 0.5);
}

vec3 getOceanColor(float t) {
    if (t < 0.5) {
        float s = t * 2.0;
        return vec3(0.0, s * 0.5, 0.25 + s * 0.75);
    } else {
        float s = (t - 0.5) * 2.0;
        return vec3(s, 0.5 + s * 0.5, 1.0);
    }
}

vec3 getMonochromeColor(float t) {
    return vec3(t);
}

vec3 getColor(float t, int paletteType) {
    if (paletteType == 0) return getClassicColor(t);
    if (paletteType == 1) return getFireColor(t);
    if (paletteType == 2) return getRainbowColor(t);
    if (paletteType == 3) return getOceanColor(t);
    return getMonochromeColor(t);
}

void main() {
    vec2 uv = gl_FragCoord.xy;

    // Calculate pixel offset from center
    float pixelOffsetX = uv.x - u_resolution.x / 2.0;
    float pixelOffsetY = uv.y - u_resolution.y / 2.0;

    // Divide by zoom
    float invZoom = 1.0 / u_zoom;
    float real = u_centerReal + pixelOffsetX * invZoom;
    float imag = u_centerImag + pixelOffsetY * invZoom;

    // Initial values
    float zr, zi, cr, ci;

    if (u_fractalType == 1) {
        // Julia: z starts at pixel, c is constant
        zr = real;
        zi = imag;
        cr = u_juliaC.x;
        ci = u_juliaC.y;
    } else {
        // Mandelbrot, BurningShip, Tricorn: z starts at 0, c is pixel
        zr = 0.0;
        zi = 0.0;
        cr = real;
        ci = imag;
    }

    int iterations = 0;
    float zr2 = zr * zr;
    float zi2 = zi * zi;

    for (int i = 0; i < 10000; i++) {
        if (i >= u_maxIterations) break;
        if (zr2 + zi2 > 4.0) break;

        float zrzi = zr * zi;

        if (u_fractalType == 2) {
            // Burning Ship: use absolute values
            zi = 2.0 * abs(zrzi) + ci;
            zr = zr2 - zi2 + cr;
        } else if (u_fractalType == 3) {
            // Tricorn: conjugate z (negate imaginary in multiplication)
            zi = -2.0 * zrzi + ci;
            zr = zr2 - zi2 + cr;
        } else {
            // Mandelbrot or Julia
            zi = 2.0 * zrzi + ci;
            zr = zr2 - zi2 + cr;
        }

        zr2 = zr * zr;
        zi2 = zi * zi;
        iterations++;
    }

    if (iterations >= u_maxIterations) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        // Smooth coloring
        float mag2 = zr2 + zi2;
        float smoothIter = float(iterations) - log2(log2(mag2)) + 4.0;
        float t = smoothIter / float(u_maxIterations);
        t = clamp(t, 0.0, 1.0);

        vec3 color = getColor(t, u_paletteType);
        gl_FragColor = vec4(color, 1.0);
    }
}
`;

export interface RenderParams {
    centerReal: number;
    centerImag: number;
    zoom: number;
    maxIterations: number;
    fractalType: FractalType;
    paletteId: string;
    juliaReal: number;
    juliaImag: number;
}

const FRACTAL_TYPE_MAP: Record<FractalType, number> = {
    mandelbrot: 0,
    julia: 1,
    burningShip: 2,
    tricorn: 3
};

const PALETTE_TYPE_MAP: Record<string, number> = {
    classic: 0,
    fire: 1,
    rainbow: 2,
    ocean: 3,
    monochrome: 4
};

export class WebGLRenderer {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private uniforms: Record<string, WebGLUniformLocation>;

    constructor(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: true });
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        this.gl = gl;

        // Create shader program
        this.program = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
        gl.useProgram(this.program);

        // Get uniform locations
        this.uniforms = {
            u_resolution: gl.getUniformLocation(this.program, 'u_resolution')!,
            u_centerReal: gl.getUniformLocation(this.program, 'u_centerReal')!,
            u_centerImag: gl.getUniformLocation(this.program, 'u_centerImag')!,
            u_zoom: gl.getUniformLocation(this.program, 'u_zoom')!,
            u_maxIterations: gl.getUniformLocation(this.program, 'u_maxIterations')!,
            u_fractalType: gl.getUniformLocation(this.program, 'u_fractalType')!,
            u_paletteType: gl.getUniformLocation(this.program, 'u_paletteType')!,
            u_juliaC: gl.getUniformLocation(this.program, 'u_juliaC')!
        };

        // Create fullscreen quad
        this.createQuad();
    }

    private createShader(type: number, source: string): WebGLShader {
        const gl = this.gl;
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compilation error: ${error}`);
        }

        return shader;
    }

    private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
        const gl = this.gl;
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);

        const program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Program linking error: ${error}`);
        }

        return program;
    }

    private createQuad(): void {
        const gl = this.gl;

        // Fullscreen quad vertices
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    resize(width: number, height: number): void {
        const gl = this.gl;
        gl.canvas.width = width;
        gl.canvas.height = height;
        gl.viewport(0, 0, width, height);
    }

    render(params: RenderParams): void {
        const gl = this.gl;

        // Set uniforms
        gl.uniform2f(this.uniforms.u_resolution, gl.canvas.width, gl.canvas.height);
        gl.uniform1f(this.uniforms.u_centerReal, params.centerReal);
        gl.uniform1f(this.uniforms.u_centerImag, params.centerImag);
        gl.uniform1f(this.uniforms.u_zoom, params.zoom);
        gl.uniform1i(this.uniforms.u_maxIterations, params.maxIterations);
        gl.uniform1i(this.uniforms.u_fractalType, FRACTAL_TYPE_MAP[params.fractalType]);
        gl.uniform1i(this.uniforms.u_paletteType, PALETTE_TYPE_MAP[params.paletteId] ?? 0);
        gl.uniform2f(this.uniforms.u_juliaC, params.juliaReal, params.juliaImag);

        // Draw fullscreen quad
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    dispose(): void {
        const gl = this.gl;
        gl.deleteProgram(this.program);
    }

    getMode(): RenderMode {
        return 'gpu';
    }
}
