import { createMapProjection } from "../../mobile-games/pets/logic/MapProjection";
import { clampZoom, getFitZoom, getHiddenCenter, getMinZoom, HIDDEN_RADIUS_METERS, MAX_ZOOM, MIN_ZOOM } from "../../mobile-games/pets/logic/PetMapLayout";
import { PET_DATA } from "../../mobile-games/pets/data/PetData";
import { createNavigator } from "../../util/geolocation/Navigator";

// A tall, narrow phone, which is the only way this game is played.
const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 600;

describe('clampZoom function from PetMapLayout', () => {
    it('should never let a zoom fall below the levels that tiles exist for', () => {
        // Tiles are only vendored for zooms 11 to 15, so nothing outside that range is renderable.
        expect(clampZoom(MIN_ZOOM - 1)).toBe(MIN_ZOOM);
        expect(clampZoom(MIN_ZOOM - 0.5)).toBe(MIN_ZOOM);
        expect(clampZoom(-100)).toBe(MIN_ZOOM);
        expect(clampZoom(MAX_ZOOM + 1)).toBe(MAX_ZOOM);
    });

    it('should honour a higher minimum without ever dropping under the hard floor', () => {
        expect(clampZoom(11, 13)).toBe(13);
        expect(clampZoom(14, 13)).toBe(14);

        // A minimum below the tiled range can't be used to sneak past it.
        expect(clampZoom(9, 9)).toBe(MIN_ZOOM);
    });
});

describe('getMinZoom function from PetMapLayout', () => {
    it('should not allow zooming out past the point where the whole play area is on screen', () => {
        const projection = createMapProjection();

        const fitZoom = getFitZoom(projection, PHONE_WIDTH, PHONE_HEIGHT);
        const minZoom = getMinZoom(projection, PHONE_WIDTH, PHONE_HEIGHT);

        // The bug this guards: the minimum used to be the hard tile floor, which on a phone sits one
        // whole level below the fit zoom, so the city could be shrunk into an island of empty map.
        expect(fitZoom).toBe(MIN_ZOOM + 1);
        expect(minZoom).toBe(fitZoom);
        expect(clampZoom(minZoom - 1, minZoom)).toBe(minZoom);
    });

    it('should stay inside the tiled range for any viewport', () => {
        const projection = createMapProjection();

        const sizes = [[1, 1], [PHONE_WIDTH, PHONE_HEIGHT], [1440, 900], [10000, 10000]];

        for (const [width, height] of sizes) {
            const minZoom = getMinZoom(projection, width, height);

            expect(minZoom).toBeGreaterThanOrEqual(MIN_ZOOM);
            expect(minZoom).toBeLessThanOrEqual(MAX_ZOOM);
        }
    });
});

describe('getHiddenCenter function from PetMapLayout', () => {
    it('should place every real pet meaningfully off-center but still inside its circle', () => {
        const projection = createMapProjection();
        const navigator = createNavigator();

        // A little slack for the flat-earth approximation in offsetLocation.
        const toleranceMeters = 2;

        for (const petData of PET_DATA) {
            const center = getHiddenCenter(projection, petData.id, petData.location);
            const meters = navigator.calculateDistanceAndBearing(petData.location, center).distance * 1000;

            // The bug this guards: a small offset leaves the "?" pointing almost straight at the
            // pet's real spot, making the hunt trivial.
            expect(meters).toBeGreaterThanOrEqual(0.4 * HIDDEN_RADIUS_METERS - toleranceMeters);
            expect(meters).toBeLessThanOrEqual(0.85 * HIDDEN_RADIUS_METERS + toleranceMeters);
        }
    });
});
