import { useState } from 'react';
import '../css/font.css';
import HorizontalLine from "./HorizontalLine";
import Dialog from '../../util/ui/Dialog';
import { Component, Invention, RAW_MATERIALS } from '../data/Component';
import { FreeMarketCommunicator } from '../logic/FreeMarketCommunicator';
import { createID } from '../../util/ID';
import Loading from './Loading';

interface InventProps {
    communicator: FreeMarketCommunicator;
}

interface State {
    name: string;
    primaryComponent: Component | null;
    secondaryComponent: Component | null;
    componentSelectionState: ComponentSelectionState;
    signed: boolean;
    dated: Date | null;
    invalidInventionUi: JSX.Element | null;
    submittingInventionUi: JSX.Element | null;
}

enum ComponentSelectionState {
    NONE, PRIMARY, SECONDARY
}

const Invent: React.FC<InventProps> = ({ communicator }) => {
    const [state, setState] = useState(createDefaultState());

    const signatureStyle: React.CSSProperties = {
        border: '1px solid white',
        width: '100%',
        fontSize: '1.25em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    if (state.signed) {
        signatureStyle.fontFamily = 'Signature';
    } else {
        signatureStyle.cursor = 'pointer';
    }

    const signedText = state.signed ? 'Landon Smith' : '(click to sign)';

    const dateStyle: React.CSSProperties = {
        border: '1px solid white',
        width: '100%',
        fontSize: '1.25em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    if (state.dated === null) {
        dateStyle.cursor = 'pointer';
    }

    const dateText = state.dated === null ? '(click to date)' : state.dated.toLocaleDateString();

    const componentHeaderStyle: React.CSSProperties = {
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: '5px'
    };

    const componentStyle: React.CSSProperties = {
        border: '1px solid white',
        padding: '5px',
        cursor: 'pointer'
    };

    const componentSelectText = '(click to select)';
    const primaryComponentText = state.primaryComponent === null ? componentSelectText : state.primaryComponent.name;
    const seconfaryComponentText = state.secondaryComponent === null ? componentSelectText : state.secondaryComponent.name;

    const updateComponentSelectionState = (selection: ComponentSelectionState) => {
        state.componentSelectionState = selection;
        setState({ ...state });
    };

    return <div>
        <Dialog
            isOpen={state.componentSelectionState !== ComponentSelectionState.NONE}
            content={componentSelectUi(
                state.componentSelectionState === ComponentSelectionState.PRIMARY ? 'Primary' : 'Secondary',
                component => {
                    if (state.componentSelectionState === ComponentSelectionState.PRIMARY) {
                        state.primaryComponent = component;
                    } else if (state.componentSelectionState === ComponentSelectionState.SECONDARY) {
                        state.secondaryComponent = component;
                    }

                    state.componentSelectionState = ComponentSelectionState.NONE;

                    setState({ ...state });
                }
            )}
        />

        <Dialog isOpen={state.invalidInventionUi !== null} content={state.invalidInventionUi!} />

        <Dialog isOpen={state.submittingInventionUi !== null} content={state.submittingInventionUi!} />

        <div style={{ display: 'flex' }}>
            <div style={{ marginRight: '15px', fontWeight: 'bold', fontSize: '1.25em' }}>Invention Name:</div>
            <input
                style={{ fontSize: '1.25em', width: '100%', padding: '10px' }}
                placeholder='Widget'
                onChange={event => {
                    state.name = event.target.value;
                    setState({ ...state });
                }}
                value={state.name}
            />
        </div>

        <HorizontalLine />

        <div style={{ fontSize: '1.25em', textAlign: 'center', fontWeight: 'bold' }}>Components</div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
                <div style={componentHeaderStyle}>Primary</div>
                <div style={componentStyle} onClick={() => updateComponentSelectionState(ComponentSelectionState.PRIMARY)}>{primaryComponentText}</div>
            </div>
            <div>
                <div style={componentHeaderStyle}>Secondary</div>
                <div style={componentStyle} onClick={() => updateComponentSelectionState(ComponentSelectionState.SECONDARY)}>{seconfaryComponentText}</div>
            </div>
        </div>

        <HorizontalLine />

        <div style={{ display: 'flex' }}>
            <div style={{ marginRight: '15px', fontWeight: 'bold' }}>Inventor Signature:</div>
            <div style={signatureStyle} onClick={() => {
                state.signed = true;
                setState({ ...state });
            }}>{signedText}</div>
        </div>

        <div style={{ display: 'flex', marginTop: '15px' }}>
            <div style={{ marginRight: '15px', fontWeight: 'bold' }}>Date Invented:</div>
            <div style={dateStyle} onClick={() => {
                state.dated = new Date();
                setState({ ...state });
            }}>{dateText}</div>
        </div>

        <HorizontalLine />

        <button style={{ fontSize: '1.5em', width: '100%' }} onClick={() => {
            if (isInventionValid(state)) {
                state.submittingInventionUi = submittingInventionUi(null);
                setState({ ...state });

                const invention = createInvention(state);

                communicator.addInvention(invention).then(() => {
                    state.submittingInventionUi = submittingInventionUi(invention, () => {
                        setState(createDefaultState());
                    });

                    setState({ ...state });
                });
            } else {
                state.invalidInventionUi = invalidInventionUi(state, () => {
                    state.invalidInventionUi = null;

                    setState({ ...state });
                });

                setState({ ...state });
            }
        }}>Invent!</button>
    </div>;
};

function componentSelectUi(header: string, onSelect: (component: Component) => void): JSX.Element {
    const rawMaterialStyle: React.CSSProperties = {
        border: '2px solid white',
        margin: '10px',
        padding: '10px',
        cursor: 'pointer'
    };

    const rawMaterials = RAW_MATERIALS.map((rawMaterial, index) => {
        return <div key={index} style={rawMaterialStyle} onClick={() => onSelect(rawMaterial)}>{rawMaterial.name}</div>;
    });

    return <div style={{ maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ fontSize: '1.25em', textAlign: 'center', fontWeight: 'bold' }}>{header}</div>

        {rawMaterials}
    </div>;
}

function isInventionValid(state: State): boolean {
    if (state.name === '') return false;
    if (state.primaryComponent === null) return false;
    if (state.secondaryComponent === null) return false;
    if (state.primaryComponent === state.secondaryComponent) return false;
    if (!state.signed) return false;
    if (state.dated === null) return false;

    return true;
}

function invalidInventionUi(state: State, onClose: () => void): JSX.Element {
    const nameUi = state.name === '' ? <li>The invention must have a name</li> : <></>;
    const primaryUi = state.primaryComponent === null ? <li>The invention must have a primary component</li> : <></>;
    const secondaryUi = state.secondaryComponent === null ? <li>The invention must have a secondary component</li> : <></>;
    const componentDifferentUi = state.primaryComponent === state.secondaryComponent ? <li>The primary and secondary components must be different</li> : <></>;
    const signedUi = !state.signed ? <li>The invention must be signed</li> : <></>;
    const datedUi = state.dated === null ? <li>The invention must be dated</li> : <></>;

    return <div>
        <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'yellow', textAlign: 'center' }}>Invalid Invention</div>
        <ul>
            {nameUi}
            {primaryUi}
            {secondaryUi}
            {componentDifferentUi}
            {signedUi}
            {datedUi}
        </ul>
        <div style={{ textAlign: 'center' }}> <button style={{ fontSize: '1em' }} onClick={onClose}>Close</button></div>
    </div>
}

function createInvention(state: State): Invention {
    return {
        id: createID(),
        name: state.name,
        primaryComponentId: state.primaryComponent?.id!,
        secondaryComponentId: state.secondaryComponent?.id!,
        inventorId: '// TODO - inventorId',
        inventedDate: state.dated?.getTime()!
    }
}

function submittingInventionUi(submittedInvention: Invention | null, onClose?: () => void): JSX.Element {
    if (submittedInvention === null) {
        return <div>
            <div style={{ textAlign: 'center', fontSize: '1.25em', fontWeight: 'bold' }}>Submitting Invention</div>
            <br />
            <Loading />
        </div>;
    } else {
        return <div>
            <div style={{ textAlign: 'center', fontSize: '1.25em', fontWeight: 'bold', color: 'lime' }}>Invention Submited!</div>
            <br />
            <button style={{ width: '100%', fontSize: '1em' }} onClick={onClose}>Close</button>
        </div>;
    }
}

function createDefaultState(): State {
    return {
        name: '',
        primaryComponent: null,
        secondaryComponent: null,
        componentSelectionState: ComponentSelectionState.NONE,
        signed: false,
        dated: null,
        invalidInventionUi: null,
        submittingInventionUi: null
    };
}

export default Invent;
