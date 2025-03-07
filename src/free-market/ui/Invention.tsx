import { Component, Invention as InventionData } from "../data/Component";
import { Inventor } from "../data/Inventor";
import ComponentUi from "./Component";

interface InventionProps {
    data: InventionData;
    componentsMapped: Map<string, Component>;
    inventorsMapped: Map<string, Inventor>;
}

const Invention: React.FC<InventionProps> = ({ data, componentsMapped, inventorsMapped }) => {
    const primaryComponent = componentsMapped.get(data.primaryComponentId);
    const secondaryComponent = componentsMapped.get(data.secondaryComponentId);
    const date = new Date(data.inventedDate).toLocaleDateString();
    const inventorName = inventorsMapped.get(data.inventorId)?.name ?? '(Unknown)';

    return <div style={{
        border: '2px solid darkorange',
        borderRadius: '15px',
        padding: '15px',
        margin: '15px',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        width: '13em',
        background: 'rgba(0, 0, 0, 0.3)',
        boxShadow: 'black 5px 5px 15px 5px'
    }}>
        <div style={{ fontSize: '1.25em', fontWeight: 'bold' }}>{data.name}</div>
        <div style={{ display: 'grid', margin: '10px 0px', gridTemplateColumns: '1fr 1fr' }}>
            <ComponentUi data={primaryComponent} />
            <ComponentUi data={secondaryComponent} />
        </div>
        <div style={{ textAlign: 'center' }}>Invented by <b>{inventorName}</b> on <b>{date}</b></div>
    </div >;
};

export default Invention;
