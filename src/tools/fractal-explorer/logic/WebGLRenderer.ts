import { FractalType } from '../data/FractalTypes';

// Vertex shader - simple fullscreen quad
const VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Fragment shader with emulated double precision for deep zooms
// Uses the "double-single" technique: each double is stored as two floats (hi, lo)
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
// Double precision center stored as (hi, lo) pairs
uniform vec2 u_centerRealDS;  // (high, low) parts of real center
uniform vec2 u_centerImagDS;  // (high, low) parts of imag center
uniform float u_zoom;
uniform int u_maxIterations;
uniform int u_fractalType;
uniform int u_paletteType;
uniform vec2 u_juliaC;

// Fractal types: 0=Mandelbrot, 1=Julia, 2=BurningShip, 3=Tricorn

// Double-single arithmetic functions
// A double-single number is represented as (hi, lo) where value = hi + lo

// Split a float into high and low parts for multiplication
vec2 ds_split(float a) {
    float t = a * 4097.0;  // 2^12 + 1
    float hi = t - (t - a);
    float lo = a - hi;
    return vec2(hi, lo);
}

// Create a double-single from a single float
vec2 ds_set(float a) {
    return vec2(a, 0.0);
}

// Add two double-single numbers
vec2 ds_add(vec2 a, vec2 b) {
    float s = a.x + b.x;
    float v = s - a.x;
    float e = (a.x - (s - v)) + (b.x - v) + a.y + b.y;
    return vec2(s + e, e - (s + e - s));
}

// Subtract two double-single numbers
vec2 ds_sub(vec2 a, vec2 b) {
    return ds_add(a, vec2(-b.x, -b.y));
}

// Multiply two double-single numbers
vec2 ds_mul(vec2 a, vec2 b) {
    float p = a.x * b.x;
    vec2 as = ds_split(a.x);
    vec2 bs = ds_split(b.x);
    float err = ((as.x * bs.x - p) + as.x * bs.y + as.y * bs.x) + as.y * bs.y;
    err += a.x * b.y + a.y * b.x;
    return vec2(p + err, err - (p + err - p));
}

// Compare double-single to float
bool ds_gt(vec2 a, float b) {
    return a.x > b || (a.x == b && a.y > 0.0);
}

// Get single float approximation from double-single
float ds_to_float(vec2 a) {
    return a.x + a.y;
}

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
    // Convert pixel coordinates to offset from center
    // At very high zoom levels, we need careful handling of the offset
    vec2 uv = gl_FragCoord.xy;

    // Calculate pixel offset from center
    float pixelOffsetX = uv.x - u_resolution.x / 2.0;
    float pixelOffsetY = uv.y - u_resolution.y / 2.0;

    // Divide by zoom - for deep zooms this will be a very small number
    // We compute this as multiplication by inverse for better precision
    float invZoom = 1.0 / u_zoom;
    float offsetX = pixelOffsetX * invZoom;
    float offsetY = pixelOffsetY * invZoom;

    // Add offset to center using double-single precision
    vec2 real = ds_add(u_centerRealDS, ds_set(offsetX));
    vec2 imag = ds_add(u_centerImagDS, ds_set(offsetY));

    // Initial values as double-single
    vec2 zr, zi, cr, ci;

    if (u_fractalType == 1) {
        // Julia: z starts at pixel, c is constant
        zr = real;
        zi = imag;
        cr = ds_set(u_juliaC.x);
        ci = ds_set(u_juliaC.y);
    } else {
        // Mandelbrot, BurningShip, Tricorn: z starts at 0, c is pixel
        zr = ds_set(0.0);
        zi = ds_set(0.0);
        cr = real;
        ci = imag;
    }

    int iterations = 0;
    vec2 zr2 = ds_mul(zr, zr);
    vec2 zi2 = ds_mul(zi, zi);

    for (int i = 0; i < 10000; i++) {
        if (i >= u_maxIterations) break;
        if (ds_to_float(ds_add(zr2, zi2)) > 4.0) break;

        vec2 zrzi = ds_mul(zr, zi);

        if (u_fractalType == 2) {
            // Burning Ship: use absolute values
            float absZrZi = abs(ds_to_float(zrzi));
            zi = ds_add(ds_set(2.0 * absZrZi), ci);
            zr = ds_add(ds_sub(zr2, zi2), cr);
        } else if (u_fractalType == 3) {
            // Tricorn: conjugate z (negate imaginary in multiplication)
            zi = ds_add(ds_set(-2.0 * ds_to_float(zrzi)), ci);
            zr = ds_add(ds_sub(zr2, zi2), cr);
        } else {
            // Mandelbrot or Julia
            zi = ds_add(ds_add(zrzi, zrzi), ci);
            zr = ds_add(ds_sub(zr2, zi2), cr);
        }

        zr2 = ds_mul(zr, zr);
        zi2 = ds_mul(zi, zi);
        iterations++;
    }

    if (iterations >= u_maxIterations) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        // Smooth coloring
        float mag2 = ds_to_float(ds_add(zr2, zi2));
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

// Split a JavaScript number into high and low float parts for double-single precision
function splitDouble(value: number): [number, number] {
    const hi = Math.fround(value);
    const lo = value - hi;
    return [hi, lo];
}

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
            u_centerRealDS: gl.getUniformLocation(this.program, 'u_centerRealDS')!,
            u_centerImagDS: gl.getUniformLocation(this.program, 'u_centerImagDS')!,
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

        // Split center coordinates into double-single format
        const [realHi, realLo] = splitDouble(params.centerReal);
        const [imagHi, imagLo] = splitDouble(params.centerImag);

        // Set uniforms
        gl.uniform2f(this.uniforms.u_resolution, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(this.uniforms.u_centerRealDS, realHi, realLo);
        gl.uniform2f(this.uniforms.u_centerImagDS, imagHi, imagLo);
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
}
