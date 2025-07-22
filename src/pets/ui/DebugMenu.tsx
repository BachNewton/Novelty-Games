import { createID } from "../../util/ID";
import Button from "../../util/ui/Button";
import Dialog from "../../util/ui/Dialog";

interface DebugMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const DebugMenu: React.FC<DebugMenuProps> = ({ isOpen, onClose }) => {
    const randomId = createID();

    const copyRandomIdToClipboard = () => { navigator.clipboard.writeText(randomId) };

    return <Dialog isOpen={isOpen}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', textAlign: 'center' }}>Debugging Menu</div>
            <div style={{ fontSize: '0.7em', textAlign: 'center' }}>Used for testing and development</div>
            <div style={{ margin: '15px' }} />

            <Button onClick={() => { }}>discoverPet</Button>
            <Button onClick={() => { }}>resetAllData</Button>
            <div>Random ID: <span style={{ fontFamily: 'monospace', cursor: 'pointer' }} onClick={copyRandomIdToClipboard}>{randomId}</span></div>
            <div>nextCycle: <span style={{ fontFamily: 'monospace' }}>TODO</span></div>

            <div style={{ margin: '15px' }} />
            <Button fontScale={1.3} onClick={onClose}>Close</Button>
        </div>
    </Dialog>;
};

export default DebugMenu;
