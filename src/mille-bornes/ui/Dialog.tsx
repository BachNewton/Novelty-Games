import { useEffect, useRef } from "react";

const DIALOG_CONTAINER_STYLE: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '20px',
    margin: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
};

interface DialogueProps {
    isOpen: boolean;
    title: string | string[];
    options?: string[];
    onSelection: (selection: string) => void;
}

const Dialog: React.FC<DialogueProps> = ({ isOpen, title, options, onSelection }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
    }, [isOpen]);

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

    const onConfirmation = () => onSelection(inputRef.current?.value || 'Player');

    const inputUi = options !== undefined
        ? options.map((option, index) => {
            const onClick = () => {
                onSelection(option);
            };

            return <button key={index} onClick={onClick} style={{ fontSize: '1.25em', margin: '0.5em', padding: '0.5em' }}>{option}</button>;
        })
        : <input ref={inputRef} style={{ fontSize: '1.25em' }} placeholder='Player' onKeyDown={(e) => { if (e.key === 'Enter') onConfirmation() }} />;

    const confirmationButton = options !== undefined
        ? <></>
        : <button onClick={() => onConfirmation()} style={{ fontSize: '1.25em', margin: '0.5em' }}>Confirm</button>;

    const titleUi = title instanceof Array ? title.map((line, index) => <div key={index}>{line}</div>) : <div>{title}</div>;

    return <div style={dialogOverlayStyle}>
        <div style={DIALOG_CONTAINER_STYLE}>
            <div style={{ fontWeight: 'bold', fontSize: '1.5em', textAlign: 'center' }}>{titleUi}</div>
            <br />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {inputUi}
                {confirmationButton}
            </div>
        </div>
    </div>;
};

export default Dialog;
