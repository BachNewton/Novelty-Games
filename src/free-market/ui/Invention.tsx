import { Component, Invention as InventionData } from "../data/Component";
import ComponentUi from "./Component";

interface InventionProps {
    data: InventionData;
    componentsMapped: Map<string, Component>;
}

const Invention: React.FC<InventionProps> = ({ data, componentsMapped }) => {
    const primaryComponent = componentsMapped.get(data.primaryComponentId);
    const secondaryComponent = componentsMapped.get(data.secondaryComponentId);
    const date = new Date(data.inventedDate).toLocaleDateString();

    return <div style={{ border: '2px solid white', borderRadius: '15px', padding: '15px', margin: '5px', display: 'flex', alignItems: 'center', flexDirection: 'column', maxWidth: '25em' }}>
        <div style={{ fontSize: '1.25em', fontWeight: 'bold' }}>{data.name}</div>
        <br />
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-evenly' }}>
            <ComponentUi data={primaryComponent} />
            <ComponentUi data={secondaryComponent} />
        </div>
        <br />
        <div>Invented by <b>{data.inventorId}</b> on <b>{date}</b></div>
    </div >;
};

export default Invention;
