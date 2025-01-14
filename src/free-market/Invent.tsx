import { useState } from 'react';
import './font/font.css';
import HorizontalLine from "./HorizontalLine";

const Invent: React.FC = () => {
    const [signed, setSigned] = useState(false);
    const [dated, setDate] = useState<Date | null>(null);

    const signatureStyle: React.CSSProperties = {
        border: '1px solid white',
        width: '100%',
        fontSize: '1.25em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    if (signed) {
        signatureStyle.fontFamily = 'Signature';
    } else {
        signatureStyle.cursor = 'pointer';
    }

    const signedText = signed ? 'Landon Smith' : '(click to sign)';

    const dateStyle: React.CSSProperties = {
        border: '1px solid white',
        width: '100%',
        fontSize: '1.25em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    if (dated === null) {
        dateStyle.cursor = 'pointer';
    }

    const dateText = dated === null ? '(click to date)' : dated.toLocaleDateString();

    const componentStyle: React.CSSProperties = {
        border: '1px solid white',
        padding: '5px',
        cursor: 'pointer'
    };

    return <div>
        <div style={{ display: 'flex' }}>
            <div style={{ marginRight: '15px', fontWeight: 'bold', fontSize: '1.25em' }}>Invention Name:</div>
            <input style={{ fontSize: '1.25em', width: '100%', padding: '10px' }} placeholder='Widget' />
        </div>

        <HorizontalLine />

        <div style={{ fontSize: '1.25em', textAlign: 'center', fontWeight: 'bold' }}>Components</div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
                <div style={{ textAlign: 'center' }}>Primary</div>
                <div style={componentStyle}>(click to select)</div>
            </div>
            <div>
                <div style={{ textAlign: 'center' }}>Secondary</div>
                <div style={componentStyle}>(click to select)</div>
            </div>
        </div>

        <HorizontalLine />

        <div style={{ display: 'flex' }}>
            <div style={{ marginRight: '15px', fontWeight: 'bold' }}>Inventor Signature:</div>
            <div style={signatureStyle} onClick={() => setSigned(true)}>{signedText}</div>
        </div>

        <div style={{ display: 'flex', marginTop: '15px' }}>
            <div style={{ marginRight: '15px', fontWeight: 'bold' }}>Date Invented:</div>
            <div style={dateStyle} onClick={() => setDate(new Date())}>{dateText}</div>
        </div>
    </div>;
};

export default Invent;
