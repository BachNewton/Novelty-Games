import Decimal from 'decimal.js';

export interface ArbitraryCoordinate {
    real: Decimal;
    imag: Decimal;
    zoom: Decimal;
}

export function createArbitraryCoordinate(
    real: number | string,
    imag: number | string,
    zoom: number | string
): ArbitraryCoordinate {
    return {
        real: new Decimal(real),
        imag: new Decimal(imag),
        zoom: new Decimal(zoom)
    };
}

export function pan(
    coord: ArbitraryCoordinate,
    deltaX: number,
    deltaY: number
): ArbitraryCoordinate {
    const dx = new Decimal(deltaX).div(coord.zoom);
    const dy = new Decimal(deltaY).div(coord.zoom);

    return {
        real: coord.real.minus(dx),
        imag: coord.imag.plus(dy),
        zoom: coord.zoom
    };
}

export function zoomAt(
    coord: ArbitraryCoordinate,
    factor: number,
    screenX: number,
    screenY: number,
    canvasWidth: number,
    canvasHeight: number
): ArbitraryCoordinate {
    // Convert screen position to complex coordinate before zoom
    const offsetX = new Decimal(screenX - canvasWidth / 2).div(coord.zoom);
    const offsetY = new Decimal(canvasHeight / 2 - screenY).div(coord.zoom);
    const complexX = coord.real.plus(offsetX);
    const complexY = coord.imag.plus(offsetY);

    // Apply zoom
    const newZoom = coord.zoom.times(factor);

    // Adjust center to keep point under cursor stationary
    const newOffsetX = new Decimal(screenX - canvasWidth / 2).div(newZoom);
    const newOffsetY = new Decimal(canvasHeight / 2 - screenY).div(newZoom);

    return {
        real: complexX.minus(newOffsetX),
        imag: complexY.minus(newOffsetY),
        zoom: newZoom
    };
}

export function toNumbers(coord: ArbitraryCoordinate): {
    centerReal: number;
    centerImag: number;
    zoom: number;
} {
    return {
        centerReal: coord.real.toNumber(),
        centerImag: coord.imag.toNumber(),
        zoom: coord.zoom.toNumber()
    };
}

export function toStrings(coord: ArbitraryCoordinate): {
    centerRealStr: string;
    centerImagStr: string;
    zoomStr: string;
} {
    return {
        centerRealStr: coord.real.toString(),
        centerImagStr: coord.imag.toString(),
        zoomStr: coord.zoom.toString()
    };
}
