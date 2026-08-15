import '../css/map.css';
import { useEffect, useMemo, useRef, useState } from "react";
import { createLocationService, Location } from "../../../util/geolocation/LocationService";
import { Pet } from "../data/Pet";
import { PET_DATA, PetData } from "../data/PetData";
import { createMapProjection, MapProjection, TILE_SIZE, WorldPoint } from "../logic/MapProjection";
import {
    clampCenter,
    clampZoom,
    getBoundsCenter,
    getHiddenCenter,
    getLayerOrigin,
    getMinZoom,
    getOverlapOffset,
    getTiles,
    getVisibleTileRange,
    HIDDEN_RADIUS_METERS,
    MIN_ZOOM,
    TileRange
} from "../logic/PetMapLayout";
import { State } from "../data/PetSave";
import FriendshipBar from "./FriendshipBar";
import { COLORS } from "./Home";
import MapTile from "./MapTile";
import SpeechBubble from "./SpeechBubble";

const MARKER_SIZE = 44;
const HIDDEN_MARKER_SIZE = 32;
const DRAG_THRESHOLD = 6;
const MAP_BACKGROUND = '#f3e7dc';
/** How much wheel delta adds up to one whole zoom level. One notch of a mouse wheel is usually 100. */
const WHEEL_STEP_DELTA = 100;
const WHEEL_LINE_PIXELS = 16;
const WHEEL_PAGE_PIXELS = 100;

interface PetMapProps {
    pets: Pet[];
    onGoToPet: (petId: string) => void;
}

interface ViewState {
    /** Always a whole level, because tiles only exist at integer zooms. */
    zoom: number;
    center: Location;
}

/**
 * A pinch in progress. The map keeps rendering at the view's zoom and is stretched to follow the
 * fingers with a CSS transform, so the gesture stays glued to them; a real zoom is only committed
 * once the fingers lift.
 */
interface PinchState {
    /** Container point the fingers started around. The map is scaled about it, so it never moves. */
    anchor: Point;
    /** How far the fingers have carried the map since, which pans it. */
    offset: Point;
    scale: number;
}

interface Size {
    width: number;
    height: number;
}

/** A pixel position on screen, as opposed to a position in the map's world. */
interface Point {
    x: number;
    y: number;
}

const PetMap: React.FC<PetMapProps> = ({ pets, onGoToPet }) => {
    const projection = useRef(createMapProjection()).current;
    const containerRef = useRef<HTMLDivElement>(null);

    const [size, setSize] = useState<Size | null>(null);
    const [view, setView] = useState<ViewState | null>(null);
    const [pinch, setPinch] = useState<PinchState | null>(null);
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [playerLocation, setPlayerLocation] = useState<Location | null>(null);

    // How far out the map is worth showing depends on how much room there is for it.
    const minZoom = size === null || size.width === 0 || size.height === 0
        ? MIN_ZOOM
        : getMinZoom(projection, size.width, size.height);

    // Gestures read the latest state without re-binding handlers.
    const viewRef = useRef(view);
    const sizeRef = useRef(size);
    const pinchRef = useRef(pinch);
    const minZoomRef = useRef(minZoom);
    viewRef.current = view;
    sizeRef.current = size;
    pinchRef.current = pinch;
    minZoomRef.current = minZoom;

    const pointers = useRef(new Map<number, Point>());
    const dragStart = useRef<{ x: number; y: number; center: Location } | null>(null);
    const pinchStart = useRef<{ distance: number; midpoint: Point } | null>(null);
    const hasDragged = useRef(false);
    const wheelDelta = useRef(0);
    const pendingCenter = useRef<Location | null>(null);
    const pendingPinch = useRef<PinchState | null>(null);
    const frame = useRef<number | null>(null);

    // A pan moves the layer directly on the DOM while the finger is down. Panning through React
    // state re-renders the whole map every frame, which lags a beat behind the finger.
    const layerRef = useRef<HTMLDivElement>(null);
    const pendingTransform = useRef<string | null>(null);
    const dragCenter = useRef<Location | null>(null);
    const lastCommitWorld = useRef<WorldPoint | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (element === null) return;

        const observer = new ResizeObserver(entries => {
            const rect = entries[0].contentRect;
            setSize({ width: rect.width, height: rect.height });
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    // The whole play area is framed as soon as we know how much room we have. A later resize can
    // raise the minimum zoom, so an already zoomed out view gets pulled back into range too.
    useEffect(() => {
        if (size === null || size.width === 0 || size.height === 0) return;

        const current = viewRef.current;
        const zoom = current === null ? minZoom : clampZoom(current.zoom, minZoom);
        const center = current === null ? getBoundsCenter() : current.center;

        setView({
            zoom: zoom,
            center: clampCenter(projection, center, zoom, size.width, size.height)
        });
    }, [size, minZoom]);

    useEffect(() => {
        const locationService = createLocationService();

        locationService.setLocationListener(location => setPlayerLocation(location));

        try {
            locationService.watchLocation();
        } catch {
            // No location is fine, the player marker is simply left off the map.
        }

        return () => locationService.stopWatching();
    }, []);

    useEffect(() => {
        return () => {
            if (frame.current !== null) cancelAnimationFrame(frame.current);
        };
    }, []);

    // Bound natively rather than through React so the wheel can be claimed before the page scrolls
    // with it. The handlers below only ever read refs, so binding once is enough.
    useEffect(() => {
        const element = containerRef.current;
        if (element === null) return;

        const onWheel = (event: WheelEvent) => {
            event.preventDefault();

            wheelDelta.current += toWheelPixels(event);

            const steps = Math.trunc(wheelDelta.current / WHEEL_STEP_DELTA);
            if (steps === 0) return;

            wheelDelta.current -= steps * WHEEL_STEP_DELTA;

            // Scrolling down zooms out.
            zoomBy(-steps, toContainerPoint(element, { x: event.clientX, y: event.clientY }));
        };

        element.addEventListener('wheel', onWheel, { passive: false });

        return () => element.removeEventListener('wheel', onWheel);
    }, []);

    const commitCenter = (center: Location) => {
        const currentView = viewRef.current;
        const currentSize = sizeRef.current;
        if (currentView === null || currentSize === null) return;

        const next: ViewState = {
            zoom: currentView.zoom,
            center: clampCenter(projection, center, currentView.zoom, currentSize.width, currentSize.height)
        };

        lastCommitWorld.current = projection.locationToWorld(next.center, next.zoom);
        viewRef.current = next;
        setView(next);
    };

    // Gesture updates are coalesced to one per frame so a fast drag doesn't queue up renders.
    const scheduleFrame = () => {
        if (frame.current !== null) return;

        frame.current = requestAnimationFrame(() => {
            frame.current = null;

            const transform = pendingTransform.current;
            pendingTransform.current = null;
            if (transform !== null && layerRef.current !== null) layerRef.current.style.transform = transform;

            const center = pendingCenter.current;
            pendingCenter.current = null;
            if (center !== null) commitCenter(center);

            const nextPinch = pendingPinch.current;
            pendingPinch.current = null;
            if (nextPinch !== null) setPinch(nextPinch);
        });
    };

    /** Commits wherever the drag has carried the map as the real view, in one state update. */
    const endDrag = () => {
        const center = dragCenter.current;

        dragCenter.current = null;
        pendingTransform.current = null;

        if (center !== null) commitCenter(center);
    };

    /** Settles on a whole zoom level while keeping `anchorLocation` under `anchor` on screen. */
    const zoomTo = (zoom: number, anchor: Point, anchorLocation: Location) => {
        const currentSize = sizeRef.current;
        if (currentSize === null) return;

        const anchorWorld = projection.locationToWorld(anchorLocation, zoom);

        const centerWorld: WorldPoint = {
            x: anchorWorld.x - (anchor.x - currentSize.width / 2),
            y: anchorWorld.y - (anchor.y - currentSize.height / 2)
        };

        const next: ViewState = {
            zoom: zoom,
            center: clampCenter(
                projection,
                projection.worldToLocation(centerWorld, zoom),
                zoom,
                currentSize.width,
                currentSize.height
            )
        };

        viewRef.current = next;
        setView(next);
    };

    const zoomBy = (steps: number, anchor: Point) => {
        const currentView = viewRef.current;
        const currentSize = sizeRef.current;
        if (currentView === null || currentSize === null) return;

        const zoom = clampZoom(currentView.zoom + steps, minZoomRef.current);
        if (zoom === currentView.zoom) return;

        zoomTo(zoom, anchor, screenToLocation(projection, anchor, currentView, currentSize));
    };

    const startDrag = (x: number, y: number) => {
        const currentView = viewRef.current;
        if (currentView === null) return;

        dragStart.current = { x: x, y: y, center: currentView.center };
        lastCommitWorld.current = projection.locationToWorld(currentView.center, currentView.zoom);
    };

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        containerRef.current?.setPointerCapture(event.pointerId);
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (pointers.current.size === 1) {
            hasDragged.current = false;
            startDrag(event.clientX, event.clientY);

            return;
        }

        // Whatever a drag in progress has already moved becomes real before the pinch anchors itself.
        endDrag();
        dragStart.current = null;
        startPinch();
    };

    const startPinch = () => {
        const midpoint = toContainerPoint(containerRef.current, getPointerMidpoint(pointers.current));

        pinchStart.current = { distance: getPointerDistance(pointers.current), midpoint: midpoint };

        setPinch({ anchor: midpoint, offset: { x: 0, y: 0 }, scale: 1 });
    };

    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!pointers.current.has(event.pointerId)) return;

        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (pointers.current.size >= 2) {
            handlePinch();
            return;
        }

        const start = dragStart.current;
        const currentView = viewRef.current;
        if (start === null || currentView === null) return;

        const deltaX = event.clientX - start.x;
        const deltaY = event.clientY - start.y;

        if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) hasDragged.current = true;

        const currentSize = sizeRef.current;
        if (currentSize === null) return;

        const zoom = currentView.zoom;
        const startWorld = projection.locationToWorld(start.center, zoom);

        const center = clampCenter(projection, projection.worldToLocation({
            x: startWorld.x - deltaX,
            y: startWorld.y - deltaY
        }, zoom), zoom, currentSize.width, currentSize.height);

        dragCenter.current = center;

        const origin = getLayerOrigin(projection, zoom);
        const topLeft = getTopLeftWorld(projection, { zoom: zoom, center: center }, currentSize);

        pendingTransform.current = `translate3d(${origin.x - topLeft.x}px, ${origin.y - topLeft.y}px, 0)`;

        // A long pan can outrun the prefetched tile margin, so the view is still committed - and
        // fresh tiles brought in - once a tile's worth of map has gone by. The committed transform
        // matches the imperative one, so nothing jumps.
        const world = projection.locationToWorld(center, zoom);
        const lastCommit = lastCommitWorld.current;

        if (lastCommit !== null && (Math.abs(world.x - lastCommit.x) > TILE_SIZE || Math.abs(world.y - lastCommit.y) > TILE_SIZE)) {
            pendingCenter.current = center;
        }

        scheduleFrame();
    };

    const handlePinch = () => {
        const start = pinchStart.current;
        if (start === null || start.distance === 0) {
            startPinch();
            return;
        }

        const currentView = viewRef.current;
        const distance = getPointerDistance(pointers.current);
        if (currentView === null || distance === 0) return;

        hasDragged.current = true;

        const midpoint = toContainerPoint(containerRef.current, getPointerMidpoint(pointers.current));

        // Limiting the stretch in zoom space rather than in raw scale means the map simply stops at
        // the ends of the range instead of stretching past them and snapping back on release.
        const zoom = clampZoom(currentView.zoom + Math.log2(distance / start.distance), minZoomRef.current);

        pendingPinch.current = {
            anchor: start.midpoint,
            offset: { x: midpoint.x - start.midpoint.x, y: midpoint.y - start.midpoint.y },
            scale: Math.pow(2, zoom - currentView.zoom)
        };

        scheduleFrame();
    };

    const endPinch = () => {
        const stretched = pendingPinch.current ?? pinchRef.current;

        pinchStart.current = null;
        pendingPinch.current = null;
        setPinch(null);

        const currentView = viewRef.current;
        const currentSize = sizeRef.current;
        if (stretched === null || currentView === null || currentSize === null) return;

        // Scaling about the anchor leaves whatever sits under it untouched, so that location is what
        // the committed zoom has to keep in place - moved by however far the fingers carried the map.
        const anchorLocation = screenToLocation(projection, stretched.anchor, currentView, currentSize);
        const zoom = Math.round(clampZoom(currentView.zoom + Math.log2(stretched.scale), minZoomRef.current));

        zoomTo(zoom, {
            x: stretched.anchor.x + stretched.offset.x,
            y: stretched.anchor.y + stretched.offset.y
        }, anchorLocation);
    };

    const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        const wasPinching = pointers.current.size >= 2;

        pointers.current.delete(event.pointerId);
        dragStart.current = null;

        if (wasPinching) endPinch();
        else endDrag();

        // A third finger lifting can leave two still down, which is simply a fresh pinch.
        if (pointers.current.size >= 2) {
            startPinch();
            return;
        }

        const remaining = Array.from(pointers.current.values())[0];
        if (remaining !== undefined) startDrag(remaining.x, remaining.y);
    };

    const origin = view === null ? null : getLayerOrigin(projection, view.zoom);

    const topLeft = view === null || size === null || origin === null
        ? null
        : getTopLeftWorld(projection, view, size);

    const tileRange = view === null || size === null || topLeft === null
        ? null
        : getVisibleTileRange(projection, view.zoom, topLeft, size.width, size.height);

    // Tiles and markers are laid out relative to a per-zoom origin, so panning only moves the
    // layer's transform. Memoising on the tile range keeps them out of the per-frame render.
    const tilesUi = useMemo(
        () => tilesUiOf(view, origin, tileRange),
        [view?.zoom, tileRange?.minX, tileRange?.maxX, tileRange?.minY, tileRange?.maxY]
    );

    const markersUi = useMemo(
        () => markersUiOf(projection, view, origin, pets, selectedPetId, petId => {
            // A tap that was really the end of a pan shouldn't open a bubble.
            if (hasDragged.current) return;

            setSelectedPetId(petId);
        }),
        [view?.zoom, pets, selectedPetId]
    );

    const playerUi = useMemo(
        () => playerUiOf(projection, view, origin, playerLocation),
        [view?.zoom, playerLocation]
    );

    const selected = selectedPetId === null
        ? null
        : PET_DATA.find(petData => petData.id === selectedPetId) ?? null;

    return <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
            if (!hasDragged.current) setSelectedPetId(null);
        }}
        style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: MAP_BACKGROUND,
            touchAction: 'none',
            overscrollBehavior: 'contain',
            userSelect: 'none',
            cursor: 'grab'
        }}
    >
        {view === null || origin === null || topLeft === null ? null : <div style={{
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '100%',
            height: '100%',
            transformOrigin: pinch === null ? undefined : `${pinch.anchor.x}px ${pinch.anchor.y}px`,
            transform: pinch === null
                ? undefined
                : `translate3d(${pinch.offset.x}px, ${pinch.offset.y}px, 0) scale(${pinch.scale})`
        }}>
            <div ref={layerRef} style={{
                position: 'absolute',
                left: '0px',
                top: '0px',
                willChange: 'transform',
                transform: `translate3d(${origin.x - topLeft.x}px, ${origin.y - topLeft.y}px, 0)`
            }}>
                {tilesUi}
                {markersUi}
                {playerUi}
            </div>
        </div>}

        {locateButtonUi(playerLocation, () => {
            if (playerLocation !== null) commitCenter(playerLocation);
        })}

        {selected === null ? null : bubbleUi(selected, pets.find(pet => pet.id === selected.id), onGoToPet)}
    </div>;
};

function tilesUiOf(view: ViewState | null, origin: WorldPoint | null, tileRange: TileRange | null): JSX.Element[] {
    if (view === null || origin === null || tileRange === null) return [];

    return getTiles(tileRange, view.zoom).map(tile => <MapTile
        key={tile.key}
        tile={tile}
        left={tile.x * TILE_SIZE - origin.x}
        top={tile.y * TILE_SIZE - origin.y}
    />);
}

function markersUiOf(
    projection: MapProjection,
    view: ViewState | null,
    origin: WorldPoint | null,
    pets: Pet[],
    selectedPetId: string | null,
    onSelect: (petId: string) => void
): JSX.Element[] {
    if (view === null || origin === null) return [];

    const saves = new Map(pets.map(pet => [pet.id, pet]));

    // Every fuzzy circle is drawn first, so circles never cover a marker and markers (drawn later)
    // win any tap where the two overlap.
    const circles = PET_DATA
        .filter(petData => saves.get(petData.id)?.discovered !== true)
        .map(petData => hiddenCircleUi(projection, view.zoom, origin, petData, onSelect));

    const markers = PET_DATA.map(petData => {
        const pet = saves.get(petData.id);
        const isSelected = selectedPetId === petData.id;

        return pet?.discovered === true
            ? discoveredMarkerUi(projection, view.zoom, origin, petData, pet, isSelected, onSelect)
            : hiddenMarkerUi(projection, view.zoom, origin, petData, isSelected, onSelect);
    });

    return [...circles, ...markers];
}

function hiddenCircleUi(
    projection: MapProjection,
    zoom: number,
    origin: WorldPoint,
    petData: PetData,
    onSelect: (petId: string) => void
): JSX.Element {
    const center = getHiddenCenter(projection, petData.id, petData.location);
    const point = toLayerPoint(projection, center, zoom, origin);
    const radius = projection.metersToPixels(HIDDEN_RADIUS_METERS, center.lat, zoom);

    return <div
        key={`circle-${petData.id}`}
        onClick={event => {
            event.stopPropagation();
            onSelect(petData.id);
        }}
        style={{
            position: 'absolute',
            left: `${point.x - radius}px`,
            top: `${point.y - radius}px`,
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            borderRadius: '50%',
            cursor: 'pointer',
            background: `radial-gradient(circle,
                rgba(0,206,209,0.38) 0%,
                rgba(0,206,209,0.30) 40%,
                rgba(255,45,149,0.22) 65%,
                rgba(255,45,149,0.08) 84%,
                rgba(255,45,149,0) 100%)`
        }}
    />;
}

function hiddenMarkerUi(
    projection: MapProjection,
    zoom: number,
    origin: WorldPoint,
    petData: PetData,
    isSelected: boolean,
    onSelect: (petId: string) => void
): JSX.Element {
    const center = getHiddenCenter(projection, petData.id, petData.location);
    const point = toLayerPoint(projection, center, zoom, origin);

    return <div
        key={`marker-${petData.id}`}
        className='pets-map-bob'
        onClick={event => {
            event.stopPropagation();
            onSelect(petData.id);
        }}
        style={{
            position: 'absolute',
            left: `${point.x - HIDDEN_MARKER_SIZE / 2}px`,
            top: `${point.y - HIDDEN_MARKER_SIZE / 2}px`,
            width: `${HIDDEN_MARKER_SIZE}px`,
            height: `${HIDDEN_MARKER_SIZE}px`,
            borderRadius: '50%',
            border: `2px dashed ${COLORS.primary}`,
            backgroundColor: 'rgba(255,255,255,0.85)',
            color: COLORS.primary,
            fontFamily: 'Pet',
            fontSize: '1.1em',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: isSelected ? `0 0 0 4px ${COLORS.secondary}, 0 2px 6px rgba(0,0,0,0.35)` : '0 2px 6px rgba(0,0,0,0.35)'
        }}
    >?</div>;
}

function discoveredMarkerUi(
    projection: MapProjection,
    zoom: number,
    origin: WorldPoint,
    petData: PetData,
    pet: Pet,
    isSelected: boolean,
    onSelect: (petId: string) => void
): JSX.Element {
    const point = toLayerPoint(projection, petData.location, zoom, origin);
    const offset = getOverlapOffset(petData.id);
    const left = point.x + offset.x - MARKER_SIZE / 2;
    const top = point.y + offset.y - MARKER_SIZE / 2;

    return <div
        key={`marker-${petData.id}`}
        onClick={event => {
            event.stopPropagation();
            onSelect(petData.id);
        }}
        style={{
            position: 'absolute',
            left: `${left}px`,
            top: `${top}px`,
            width: `${MARKER_SIZE}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer'
        }}
    >
        <img
            src={petData.images.greetLowFriendship}
            alt={pet.name}
            draggable={false}
            style={{
                width: `${MARKER_SIZE}px`,
                height: `${MARKER_SIZE}px`,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${COLORS.primary}`,
                boxSizing: 'border-box',
                backgroundColor: 'white',
                boxShadow: isSelected ? `0 0 0 4px ${COLORS.secondary}, 0 2px 6px rgba(0,0,0,0.4)` : '0 2px 6px rgba(0,0,0,0.4)'
            }}
        />

        {isNapping(pet) ? <div style={{
            position: 'absolute',
            top: '-6px',
            right: '-8px',
            padding: '0px 3px',
            borderRadius: '8px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            fontSize: '0.8em'
        }}>💤</div> : null}

        <div style={{
            marginTop: '2px',
            padding: '0px 5px',
            borderRadius: '8px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            fontFamily: 'Pet',
            fontSize: '0.7em',
            whiteSpace: 'nowrap'
        }}>{pet.name}</div>
    </div>;
}

function playerUiOf(
    projection: MapProjection,
    view: ViewState | null,
    origin: WorldPoint | null,
    playerLocation: Location | null
): JSX.Element | null {
    if (view === null || origin === null || playerLocation === null) return null;

    const point = toLayerPoint(projection, playerLocation, view.zoom, origin);
    const size = 22;

    return <div style={{
        position: 'absolute',
        left: `${point.x - size / 2}px`,
        top: `${point.y - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: 'none'
    }}>
        <div
            className='pets-map-pulse'
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: COLORS.secondary
            }}
        />

        <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px solid white',
            boxSizing: 'border-box',
            backgroundColor: COLORS.secondary,
            boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '10px'
        }}>🐾</div>
    </div>;
}

function bubbleUi(petData: PetData, pet: Pet | undefined, onGoToPet: (petId: string) => void): JSX.Element {
    const isDiscovered = pet?.discovered === true;

    return <div
        className='pets-map-pop-in'
        onClick={event => event.stopPropagation()}
        onPointerDown={event => event.stopPropagation()}
        style={{
            position: 'absolute',
            left: '10px',
            right: '10px',
            bottom: '10px',
            maxHeight: '45%',
            overflow: 'auto'
        }}
    >
        {/* Keying the reveal on the pet restarts the typing for a different marker, while tapping
            the same one again simply leaves the finished text alone. */}
        <SpeechBubble
            text={isDiscovered ? undefined : petData.dialogue.hidden}
            revealKey={petData.id}
            style={{ width: '100%', margin: 0, backgroundColor: 'rgba(0,0,0,0.78)' }}
            footer={goToPetButtonUi(isDiscovered ? `Visit ${petData.name}` : 'Find them', () => onGoToPet(petData.id))}
        >
            {isDiscovered ? discoveredBubbleContentUi(petData, pet!) : null}
        </SpeechBubble>
    </div>;
}

/** Lives inside the bubble and dresses like it, rather than as a bare browser button. */
function goToPetButtonUi(label: string, onGoToPet: () => void): JSX.Element {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <button
            onClick={onGoToPet}
            style={{
                fontFamily: 'Pet',
                fontSize: '0.9em',
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: `2px solid ${COLORS.secondary}`,
                borderRadius: '18px',
                padding: '6px 24px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                cursor: 'pointer'
            }}
        >{label} 🐾</button>
    </div>;
}

/** Just the name and the same friendship bar the pet's own page shows, glow and all. */
function discoveredBubbleContentUi(petData: PetData, pet: Pet): JSX.Element {
    return <>
        <div style={{ color: COLORS.primary, textAlign: 'center' }}>{pet.name}</div>

        <FriendshipBar
            isDiscovered={true}
            level={pet.friendship}
            animationKey={petData.id}
            style={{ position: 'relative', top: '0px', width: 'auto', margin: '8px 4px 2px' }}
        />
    </>;
}

/** Mirrors what the pet's own page will show: a pet whose cycle has passed flips state on the next visit. */
function isNapping(pet: Pet): boolean {
    const isAsleep = pet.state === State.ASLEEP;

    if (pet.nextCycle !== null && pet.nextCycle < Date.now()) return !isAsleep;

    return isAsleep;
}

/** Zooming is left to pinching and the wheel, so recentring on the player is the only button. */
function locateButtonUi(playerLocation: Location | null, onLocate: () => void): JSX.Element {
    const isEnabled = playerLocation !== null;

    return <div
        onPointerDown={event => event.stopPropagation()}
        onClick={event => {
            event.stopPropagation();

            if (isEnabled) onLocate();
        }}
        style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '2px solid white',
            boxSizing: 'border-box',
            backgroundColor: COLORS.secondary,
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // Sized in pixels so the Scaffold's font scaling can't grow the paw past the circle.
            fontSize: '16px',
            lineHeight: '1',
            cursor: isEnabled ? 'pointer' : 'default',
            opacity: isEnabled ? 1 : 0.4
        }}
    >🐾</div>;
}

/** Wheel deltas arrive in pixels, lines or pages depending on the device, so they're evened out. */
function toWheelPixels(event: WheelEvent): number {
    if (event.deltaMode === event.DOM_DELTA_LINE) return event.deltaY * WHEEL_LINE_PIXELS;
    if (event.deltaMode === event.DOM_DELTA_PAGE) return event.deltaY * WHEEL_PAGE_PIXELS;

    return event.deltaY;
}

function toLayerPoint(projection: MapProjection, location: Location, zoom: number, origin: WorldPoint): WorldPoint {
    const world = projection.locationToWorld(location, zoom);

    return { x: world.x - origin.x, y: world.y - origin.y };
}

function getTopLeftWorld(projection: MapProjection, view: ViewState, size: Size): WorldPoint {
    const center = projection.locationToWorld(view.center, view.zoom);

    return { x: center.x - size.width / 2, y: center.y - size.height / 2 };
}

function screenToLocation(projection: MapProjection, point: Point, view: ViewState, size: Size): Location {
    const topLeft = getTopLeftWorld(projection, view, size);

    return projection.worldToLocation({ x: topLeft.x + point.x, y: topLeft.y + point.y }, view.zoom);
}

function getPointerDistance(pointers: Map<number, Point>): number {
    const [first, second] = Array.from(pointers.values());
    if (first === undefined || second === undefined) return 0;

    return Math.hypot(second.x - first.x, second.y - first.y);
}

function getPointerMidpoint(pointers: Map<number, Point>): Point {
    const [first, second] = Array.from(pointers.values());
    if (first === undefined || second === undefined) return { x: 0, y: 0 };

    return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}

function toContainerPoint(container: HTMLDivElement | null, point: Point): Point {
    if (container === null) return point;

    const rect = container.getBoundingClientRect();

    return { x: point.x - rect.left, y: point.y - rect.top };
}

export default PetMap;
