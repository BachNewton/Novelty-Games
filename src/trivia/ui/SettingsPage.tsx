import { useEffect, useState } from "react";

interface SettingsPageProps {
    content: Promise<JSX.Element>;
    onCancel: () => void;
    onConfirm: () => void;
}

interface State { }
class LoadingState implements State { }
class ReadyState implements State {
    content: JSX.Element;

    constructor(content: JSX.Element) {
        this.content = content;
    }
}

const SettingsPage: React.FC<SettingsPageProps> = ({ content, onCancel, onConfirm }) => {
    const [state, setState] = useState<State>(new LoadingState());

    useEffect(() => {
        content.then((readyContent) => {
            setState(new ReadyState(readyContent));
        });
    }, [content]);

    const ui = state instanceof ReadyState
        ? state.content
        : <div style={{ display: 'flex', height: '100dvh', justifyContent: 'center', alignItems: 'center' }}>
            <div>Loading...</div>
        </div>;

    return <div style={{ color: 'white', paddingLeft: '1em', paddingRight: '1em' }}>
        <button style={{ position: 'fixed', left: '0.25em', top: '0.25em' }} onClick={onCancel}>❌ Cancel</button>
        <button style={{ position: 'fixed', right: '0.25em', top: '0.25em' }} onClick={onConfirm}>Confirm ✅</button>
        {ui}
    </div>;
}

export default SettingsPage;
