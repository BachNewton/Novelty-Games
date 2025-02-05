import { useEffect, useState } from "react";
import { Component, Invention, RAW_MATERIALS } from "../data/Component";
import { FreeMarketCommunicator } from "../logic/FreeMarketCommunicator";
import HorizontalLine from "./HorizontalLine";
import InventionUi from "./Invention";
import { Inventor } from "../data/Inventor";
import Loading from "../../util/ui/Loading";

interface PatentProps {
    communicator: FreeMarketCommunicator
}

interface State { }

class LoadingState implements State { }

class ReadyState implements State {
    inventions: Invention[];
    componentsMapped: Map<string, Component>;
    inventorsMapped: Map<string, Inventor>;

    constructor(inventions: Invention[], componentsMapped: Map<string, Component>, inventorsMapped: Map<string, Inventor>) {
        this.inventions = inventions;
        this.componentsMapped = componentsMapped;
        this.inventorsMapped = inventorsMapped;
    }
}

const Patent: React.FC<PatentProps> = ({ communicator }) => {
    const [state, setState] = useState<State>(new LoadingState());

    useEffect(() => {
        Promise.all([
            communicator.getInventions(),
            communicator.getInventors()
        ]).then(response => {
            const inventions = response[0];
            const inventors = response[1];

            const components = ([] as Component[]).concat(inventions, RAW_MATERIALS);
            const componentsMapped = new Map(components.map(component => [component.id, component]));

            const inventorsMapped = new Map(inventors.map(inventor => [inventor.id, inventor]));

            setState(new ReadyState(inventions, componentsMapped, inventorsMapped));
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
                return <InventionUi
                    key={index}
                    data={invention}
                    componentsMapped={state.componentsMapped}
                    inventorsMapped={state.inventorsMapped}
                />;
            });

        return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16em, 1fr))', justifyItems: 'center' }}>{inventions}</div>;
    } else {
        return <Loading />;
    }
}

export default Patent;
