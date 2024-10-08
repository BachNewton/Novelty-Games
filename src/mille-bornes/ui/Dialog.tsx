const DIALOG_CONTAINER_STYLE: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '20px',
    margin: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
};

interface DialogueProps {
    isOpen: boolean;
    title: string;
    options: string[];
    onSelection: (option: string) => void;
}

const Dialog: React.FC<DialogueProps> = ({ isOpen, title, options, onSelection }) => {
    const dialogOverlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: isOpen ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    };

    const optionsUi = options.map((option, index) => {
        const onClick = () => {
            onSelection(option);
        };

        return <button key={index} onClick={onClick} style={{ fontSize: '1.25em', margin: '0.5em', padding: '0.5em' }}>{option}</button>;
    });


    return <div style={dialogOverlayStyle}>
        <div style={DIALOG_CONTAINER_STYLE}>
            <div style={{ fontWeight: 'bold', fontSize: '1.5em', textAlign: 'center' }}>{title}</div>
            <br />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {optionsUi}
            </div>
        </div>
    </div>;
};

export default Dialog;
