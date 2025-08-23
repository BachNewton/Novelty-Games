interface MainProps { }

const Main: React.FC<MainProps> = ({ }) => {
    return <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%'
    }}>
        <div style={{
            border: '2px white solid',
            borderRadius: '15px',
            height: '75%',
            margin: '10px',
            padding: '10px'
        }}>Edit Pannel</div>
    </div>;
};

export function getOverlay(): JSX.Element {
    return <Main />;
}
