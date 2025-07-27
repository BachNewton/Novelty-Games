import { createID } from "../../../util/ID";
import Button from "../../../util/ui/Button";
import Dialog from "../../../util/ui/Dialog";
import { Pet } from "../data/Pet";
import { PetsDebugger } from "../logic/PetsDebugger";

interface DebugMenuProps {
    isOpen: boolean;
    onClose: () => void;
    discoverPet: () => void;
    petsDebugger: PetsDebugger;
    selectedPet: Pet;
}

const DebugMenu: React.FC<DebugMenuProps> = ({ isOpen, onClose, discoverPet, petsDebugger, selectedPet }) => {
    const randomId = createID();

    const copyRandomIdToClipboard = () => { navigator.clipboard.writeText(randomId) };

    return <Dialog isOpen={isOpen}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', textAlign: 'center' }}>Debugging Menu</div>
            <div style={{ fontSize: '0.75em', textAlign: 'center' }}>Used for testing and development</div>
            <div style={{ margin: '10px' }} />

            <Button onClick={discoverPet}>discoverPet</Button>
            <Button onClick={() => petsDebugger.setHighFriendship(selectedPet)}>setHighFriendship</Button>
            <Button onClick={petsDebugger.resetAllData}>resetAllData</Button>
            <div>Random ID: <span style={{ fontFamily: 'monospace', cursor: 'pointer' }} onClick={copyRandomIdToClipboard}>{randomId}</span></div>
            <div>nextCycle: <span style={{ fontFamily: 'monospace' }}>{petsDebugger.nextCycle(selectedPet)}</span></div>

            <div style={{ margin: '10px' }} />
            <Button fontScale={1.3} onClick={onClose}>Close</Button>
        </div>
    </Dialog>;
};

export default DebugMenu;
