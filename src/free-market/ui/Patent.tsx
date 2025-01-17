import { useEffect, useState } from "react";
import { Component, Invention, RAW_MATERIALS } from "../data/Component";
import { FreeMarketCommunicator } from "../logic/FreeMarketCommunicator";
import HorizontalLine from "./HorizontalLine";
import Loading from "./Loading";
import InventionUi from "./Invention";

interface PatentProps {
    communicator: FreeMarketCommunicator
}

interface State { }

class LoadingState implements State { }

class ReadyState implements State {
    inventions: Invention[];
    componentsMapped: Map<string, Component>;

    constructor(inventions: Invention[], componentsMapped: Map<string, Component>) {
        this.inventions = inventions;
        this.componentsMapped = componentsMapped;
    }
}

const Patent: React.FC<PatentProps> = ({ communicator }) => {
    const [state, setState] = useState<State>(new LoadingState());

    useEffect(() => {
        console.log('once');
        communicator.getInventions().then(inventions => {
            const components = ([] as Component[]).concat(inventions, RAW_MATERIALS);
            const componentsMapped = new Map(components.map(component => [component.id, component]));

            setState(new ReadyState(inventions, componentsMapped));
        });
    }, []);

    return <div>
        <div style={{ fontSize: '1.5em', fontWeight: 'bold', textAlign: 'center' }}>Patent Office</div>

        <HorizontalLine />

        {inventionsUi(state)}
    </div>;
}

function inventionsUi(state: State): JSX.Element {
    if (state instanceof ReadyState) {
        const inventions = state.inventions.length === 0
            ? <div>No inventions found</div>
            : state.inventions.map((invention, index) => {
                return <InventionUi key={index} data={invention} componentsMapped={state.componentsMapped} />;
            });

        return <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>{inventions}</div>;
    } else {
        return <Loading />;
    }
}

export default Patent;
