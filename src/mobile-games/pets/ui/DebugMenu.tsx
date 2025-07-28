import { DistanceAndBearing } from "../../../util/geolocation/Navigator";
import { createID } from "../../../util/ID";
import Button from "../../../util/ui/Button";
import Dialog from "../../../util/ui/Dialog";
import { Pet } from "../data/Pet";
import { PetsDebugger } from "../logic/PetsDebugger";

interface DebugMenuProps {
    isOpen: boolean;
    onClose: () => void;
    discoverPet: () => void;
    forceNextCycle: () => void;
    setHighFriendship: () => void;
    petsDebugger: PetsDebugger;
    selectedPet: Pet;
    heading: number | null;
    distanceAndBearing: DistanceAndBearing | null;
    arrowRotation: number | null;
}

const DebugMenu: React.FC<DebugMenuProps> = ({ isOpen, onClose, discoverPet, forceNextCycle, setHighFriendship, petsDebugger, selectedPet, heading, distanceAndBearing, arrowRotation }) => {
    const randomId = createID();

    const copyRandomIdToClipboard = () => { navigator.clipboard.writeText(randomId) };

    return <Dialog isOpen={isOpen}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', textAlign: 'center' }}>Debugging Menu</div>
            <div style={{ fontSize: '0.75em', textAlign: 'center' }}>Used for testing and development</div>
            <div style={{ margin: '10px' }} />

            <div>Pet Name: <span style={{ fontFamily: 'monospace' }}>{selectedPet.name}</span></div>
            <div>Compass Heading: <span style={{ fontFamily: 'monospace' }}>{heading?.toFixed(1)}°</span></div>
            <div>Bearing to Pet: <span style={{ fontFamily: 'monospace' }}>{distanceAndBearing?.bearing.toFixed(1)}°</span></div>
            <div>Arrow Rotation: <span style={{ fontFamily: 'monospace' }}>{arrowRotation?.toFixed(1)}°</span></div>
            <Button onClick={discoverPet}>discoverPet</Button>
            <Button onClick={async () => {
                await petsDebugger.setHighFriendship(selectedPet);
                setHighFriendship();
            }}>setHighFriendship</Button>
            <Button onClick={forceNextCycle}>forceNextCycle</Button>
            <Button onClick={petsDebugger.resetAllData}>resetAllData</Button>
            <div>Random ID: <span style={{ fontFamily: 'monospace', cursor: 'pointer' }} onClick={copyRandomIdToClipboard}>{randomId}</span></div>
            <div>nextCycle: <span style={{ fontFamily: 'monospace' }}>{petsDebugger.nextCycle(selectedPet)}</span></div>
            <div>Friendship: <span style={{ fontFamily: 'monospace' }}>{selectedPet.friendship}</span></div>

            <div style={{ margin: '10px' }} />
            <Button fontScale={1.3} onClick={onClose}>Close</Button>
        </div>
    </Dialog>;
};

export default DebugMenu;
