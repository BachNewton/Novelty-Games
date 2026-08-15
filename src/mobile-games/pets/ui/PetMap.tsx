import '../css/map.css';
import { useEffect, useMemo, useRef, useState } from "react";
import { createLocationService, Location } from "../../../util/geolocation/LocationService";
import { Pet } from "../data/Pet";
import { PET_DATA, PetData } from "../data/PetData";
import { createMapProjection, MapProjection, TILE_SIZE, WorldPoint } from "../logic/MapProjection";
import {
    clampCenter,
    getBoundsCenter,
    getFitZoom,
    getHiddenCenter,
    getLayerOrigin,
    getOverlapOffset,
    getTiles,
    getVisibleTileRange,
    HIDDEN_RADIUS_METERS,
    MAP_ATTRIBUTION,
    MAX_ZOOM,
    MIN_ZOOM,
    TileRange
} from "../logic/PetMapLayout";
import { MAX_HEARTS } from "./FriendshipBar";
import { COLORS } from "./Home";
import MapTile from "./MapTile";
import TextBubble from "./TextBubble";

const MARKER_SIZE = 44;
const HIDDEN_MARKER_SIZE = 32;
const DRAG_THRESHOLD = 6;
/** How far apart two fingers have to travel before the map steps a whole zoom level. */
const PINCH_STEP = 1.6;
const MAP_BACKGROUND = '#f3e7dc';

interface PetMapProps {
    pets: Pet[];
}

interface ViewState {
    zoom: number;
    center: Location;
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

const PetMap: React.FC<PetMapProps> = ({ pets }) => {
    const projection = useRef(createMapProjection()).current;
    const containerRef = useRef<HTMLDivElement>(null);

    const [size, setSize] = useState<Size | null>(null);
    const [view, setView] = useState<ViewState | null>(null);
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [playerLocation, setPlayerLocation] = useState<Location | null>(null);

    // Gestures read the latest view/size without re-binding handlers.
    const viewRef = useRef(view);
    const sizeRef = useRef(size);
    viewRef.current = view;
    sizeRef.current = size;

    const pointers = useRef(new Map<number, Point>());
    const dragStart = useRef<{ x: number; y: number; center: Location } | null>(null);
    const pinchDistance = useRef<number | null>(null);
    const hasDragged = useRef(false);
    const pendingCenter = useRef<Location | null>(null);
    const frame = useRef<number | null>(null);

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

    // The whole play area is framed as soon as we know how much room we have.
    useEffect(() => {
        if (size === null || view !== null || size.width === 0 || size.height === 0) return;

        const zoom = getFitZoom(projection, size.width, size.height);

        setView({
            zoom: zoom,
            center: clampCenter(projection, getBoundsCenter(), zoom, size.width, size.height)
        });
    }, [size]);

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

    const commitCenter = (center: Location) => {
        const currentView = viewRef.current;
        const currentSize = sizeRef.current;
        if (currentView === null || currentSize === null) return;

        const next: ViewState = {
            zoom: currentView.zoom,
            center: clampCenter(projection, center, currentView.zoom, currentSize.width, currentSize.height)
        };

        viewRef.current = next;
        setView(next);
    };

    // Panning is coalesced to one update per frame so a fast drag doesn't queue up renders.
    const scheduleCenter = (center: Location) => {
        pendingCenter.current = center;

        if (frame.current !== null) return;

        frame.current = requestAnimationFrame(() => {
            frame.current = null;

            const next = pendingCenter.current;
            if (next !== null) commitCenter(next);
        });
    };

    const zoomBy = (steps: number, anchor?: Point) => {
        const currentView = viewRef.current;
        const currentSize = sizeRef.current;
        if (currentView === null || currentSize === null) return;

        const zoom = Math.min(Math.max(currentView.zoom + steps, MIN_ZOOM), MAX_ZOOM);
        if (zoom === currentView.zoom) return;

        const point = anchor ?? { x: currentSize.width / 2, y: currentSize.height / 2 };
        const anchorLocation = screenToLocation(projection, point, currentView, currentSize);
        const anchorWorld = projection.locationToWorld(anchorLocation, zoom);

        const centerWorld: WorldPoint = {
            x: anchorWorld.x - (point.x - currentSize.width / 2),
            y: anchorWorld.y - (point.y - currentSize.height / 2)
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

    const startDrag = (x: number, y: number) => {
        const currentView = viewRef.current;
        if (currentView === null) return;

        dragStart.current = { x: x, y: y, center: currentView.center };
    };

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        containerRef.current?.setPointerCapture(event.pointerId);
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        hasDragged.current = false;

        if (pointers.current.size === 1) {
            startDrag(event.clientX, event.clientY);
        } else {
            dragStart.current = null;
            pinchDistance.current = getPointerDistance(pointers.current);
        }
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

        const startWorld = projection.locationToWorld(start.center, currentView.zoom);

        scheduleCenter(projection.worldToLocation({
            x: startWorld.x - deltaX,
            y: startWorld.y - deltaY
        }, currentView.zoom));
    };

    const handlePinch = () => {
        const start = pinchDistance.current;
        const distance = getPointerDistance(pointers.current);
        if (start === null || start === 0 || distance === 0) return;

        const scale = distance / start;
        const steps = scale > PINCH_STEP ? 1 : scale < 1 / PINCH_STEP ? -1 : 0;
        if (steps === 0) return;

        hasDragged.current = true;
        pinchDistance.current = distance;
        zoomBy(steps, toContainerPoint(containerRef.current, getPointerMidpoint(pointers.current)));
    };

    const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        pointers.current.delete(event.pointerId);
        dragStart.current = null;
        pinchDistance.current = null;

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
        onWheel={event => zoomBy(
            event.deltaY < 0 ? 1 : -1,
            toContainerPoint(containerRef.current, { x: event.clientX, y: event.clientY })
        )}
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
            willChange: 'transform',
            transform: `translate3d(${origin.x - topLeft.x}px, ${origin.y - topLeft.y}px, 0)`
        }}>
            {tilesUi}
            {markersUi}
            {playerUi}
        </div>}

        {controlsUi(() => zoomBy(1), () => zoomBy(-1), playerLocation, () => {
            if (playerLocation !== null) commitCenter(playerLocation);
        })}

        {selected === null ? null : bubbleUi(selected, pets.find(pet => pet.id === selected.id))}

        {attributionUi()}
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

function bubbleUi(petData: PetData, pet: Pet | undefined): JSX.Element {
    const isDiscovered = pet?.discovered === true;

    const heading = isDiscovered ? pet!.name : 'You hear a faint voice...';
    const text = isDiscovered ? getFriendshipLine(pet!) : petData.dialogue.hidden;

    return <div
        className='pets-map-pop-in'
        onClick={event => event.stopPropagation()}
        style={{
            position: 'absolute',
            left: '10px',
            right: '10px',
            bottom: '30px',
            maxHeight: '45%',
            overflow: 'auto'
        }}
    >
        <TextBubble
            text={text}
            reveal={false}
            italic={!isDiscovered}
            style={{ backgroundColor: 'rgba(0,0,0,0.78)' }}
        >
            <div style={{
                color: isDiscovered ? COLORS.primary : COLORS.secondary,
                fontStyle: 'normal',
                marginBottom: '4px'
            }}>
                {heading}

                {isDiscovered ? <span style={{ marginLeft: '8px' }}>{getHearts(pet!)}</span> : null}
            </div>
        </TextBubble>
    </div>;
}

function getHearts(pet: Pet): string {
    const filled = Math.min(pet.friendship, MAX_HEARTS);

    return '🩷'.repeat(filled) + '🤍'.repeat(MAX_HEARTS - filled);
}

function getFriendshipLine(pet: Pet): string {
    if (pet.friendship >= MAX_HEARTS) return `Best friends! ${pet.name} lights up whenever you visit.`;
    if (pet.friendship === 0) return `You've met ${pet.name}! Visit again to start growing your friendship.`;

    return `You and ${pet.name} are ${pet.friendship} of ${MAX_HEARTS} hearts along the way to being best friends.`;
}

function controlsUi(
    onZoomIn: () => void,
    onZoomOut: () => void,
    playerLocation: Location | null,
    onLocate: () => void
): JSX.Element {
    return <div
        onPointerDown={event => event.stopPropagation()}
        onClick={event => event.stopPropagation()}
        style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}
    >
        {controlButtonUi('+', onZoomIn, true)}
        {controlButtonUi('−', onZoomOut, true)}
        {controlButtonUi('🐾', onLocate, playerLocation !== null)}
    </div>;
}

function controlButtonUi(label: string, onClick: () => void, isEnabled: boolean): JSX.Element {
    return <div
        onClick={() => {
            if (isEnabled) onClick();
        }}
        style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: `2px solid ${COLORS.secondary}`,
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.1em',
            cursor: isEnabled ? 'pointer' : 'default',
            opacity: isEnabled ? 1 : 0.4
        }}
    >{label}</div>;
}

function attributionUi(): JSX.Element {
    return <div style={{
        position: 'absolute',
        right: '4px',
        bottom: '4px',
        padding: '2px 6px',
        borderRadius: '6px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'rgba(255,255,255,0.85)',
        fontSize: '0.55em',
        pointerEvents: 'none'
    }}>{MAP_ATTRIBUTION}</div>;
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
