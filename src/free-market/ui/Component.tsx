import { Component as ComponentData } from "../data/Component";

interface ComponentProps {
    data: ComponentData | undefined;
    onClick?: () => void;
}

const Component: React.FC<ComponentProps> = ({ data, onClick }) => {
    const name = data?.name ?? '(Unknown)';
    const cursor = onClick === undefined ? 'default' : 'pointer';

    return <div style={{
        border: '2px solid var(--novelty-blue)',
        padding: '10px',
        margin: '10px',
        borderRadius: '15px',
        cursor: cursor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.3)'
    }} onClick={onClick}>
        {name}
    </div>;
};

export default Component;
