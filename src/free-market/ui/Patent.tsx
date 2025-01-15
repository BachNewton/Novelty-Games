import { useEffect, useState } from "react";
import { Invention } from "../data/Component";
import { FreeMarketCommunicator } from "../logic/FreeMarketCommunicator";
import HorizontalLine from "./HorizontalLine";
import Loading from "./Loading";

interface PatentProps {
    communicator: FreeMarketCommunicator
}

interface State {
    inventions: Invention[] | null;
}

const Patent: React.FC<PatentProps> = ({ communicator }) => {
    const [state, setState] = useState<State>({ inventions: null });

    useEffect(() => {
        communicator.getInventions().then(inventions => {
            state.inventions = inventions;
            setState({ ...state });
        });
    }, [state]);

    return <div>
        <div style={{ fontSize: '1.5em', fontWeight: 'bold', textAlign: 'center' }}>Patent Office</div>

        <HorizontalLine />

        {inventionsUi(state.inventions)}
    </div>;
}

function inventionsUi(inventions: Invention[] | null): JSX.Element {
    if (inventions === null) {
        return <Loading />;
    } else if (inventions.length === 0) {
        return <div>No Inventions</div>;
    } else {
        const inventionsItems = inventions.map((invention, index) => {
            return <div key={index}>{invention.name}</div>;
        });

        return <div>{inventionsItems}</div>;
    }
}

export default Patent;
