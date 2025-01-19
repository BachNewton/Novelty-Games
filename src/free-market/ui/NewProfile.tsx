import { useState } from "react";
import { FreeMarketSave } from "../data/FreeMarketSave";
import Loading from "./Loading";
import { FreeMarketCommunicator } from "../logic/FreeMarketCommunicator";
import { createID } from "../../util/ID";
import { Inventor } from "../data/Inventor";
import { StorageKey, Storer } from "../../util/Storage";
import { RAW_MATERIALS } from "../data/Component";

interface NewProfileProps {
    communicator: FreeMarketCommunicator;
    storer: Storer<FreeMarketSave>;
    onComplete: (save: FreeMarketSave) => void;
}

enum State {
    EDIT, INVALID, SUBMITTING
}

const NewProfile: React.FC<NewProfileProps> = ({ communicator, storer, onComplete }) => {
    const [name, setName] = useState('');
    const [state, setState] = useState<State>(State.EDIT);

    const onStart = () => {
        if (isValid(name)) {
            setState(State.SUBMITTING);

            const inventor: Inventor = {
                name: name,
                id: createID()
            };

            communicator.addInventor(inventor).then(() => {
                const save = createNewSave(inventor);

                storer.save(StorageKey.FREE_MARKET, save);

                onComplete(save);
            });
        } else {
            setState(State.INVALID);
        }
    };

    return <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        {ui(state, name => setName(name), onStart, () => setState(State.EDIT))}
    </div>;
};

function ui(state: State, onNameChange: (name: string) => void, onStart: () => void, onInvalidClose: () => void): JSX.Element {
    switch (state) {
        case State.EDIT:
            return editUi(onNameChange, onStart);
        case State.INVALID:
            return invalidUi(onInvalidClose);
        case State.SUBMITTING:
            return submittingUi();
    }
}

function editUi(onChange: (name: string) => void, onStart: () => void): JSX.Element {
    return <>
        <div style={{ fontSize: '1.5em', fontWeight: 'bold', textAlign: 'center', marginBottom: '15px' }}>Welcome to the Free Market!</div>
        <div>What is your name?</div>
        <input style={{ fontSize: '1em', textAlign: 'center' }} placeholder='Inventor' onChange={e => onChange(e.target.value)} />
        <button style={{ fontSize: '1.25em', padding: '5px', marginTop: '30px' }} onClick={onStart}>Start Inventing!</button>
    </>;
}

function invalidUi(onClose: () => void): JSX.Element {
    return <>
        <div style={{ fontSize: '1.5em', fontWeight: 'bold', textAlign: 'center', color: 'yellow' }}>Invalid Name</div>
        <ul>
            <li>Name can't be empty</li>
        </ul>
        <button style={{ fontSize: '1.25em', padding: '5px' }} onClick={onClose}>Close</button>
    </>;
}

function submittingUi(): JSX.Element {
    return <>
        <div style={{ fontSize: '1.5em', fontWeight: 'bold', textAlign: 'center' }}>Creating Inventor</div>
        <br />
        <div style={{ width: '100%' }}><Loading /></div>
    </>;
}

function isValid(name: string): boolean {
    return name.length > 0;
}

function createNewSave(inventor: Inventor): FreeMarketSave {
    return {
        inventor: inventor,
        money: 0,
        extractionDetails: null,
        inentory: RAW_MATERIALS.map(material => {
            return {
                componentId: material.id,
                quantity: 0
            };
        })
    };
}

export default NewProfile;
