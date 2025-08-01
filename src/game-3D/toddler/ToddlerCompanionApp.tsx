import { createNetworkService, NetworkedApplication } from "../../util/networking/NetworkService";
import { Color, Shape, ToddlerServerClearData, ToddlerServerData, ToddlerServerObjectData } from "./ToddlerServerData";

const ToddlerCompanionApp: React.FC = () => {
    const networkService = createNetworkService<ToddlerServerData>(NetworkedApplication.MARBLE);

    const buttonStyle: React.CSSProperties = {
        fontSize: '3em'
    };

    const broadcastObject = (shape: Shape, color: Color) => {
        const data: ToddlerServerObjectData = {
            type: 'object',
            shape: shape,
            color: color
        };

        networkService.broadcast(data);
    };

    const broadcastClear = () => {
        const data: ToddlerServerClearData = { type: 'clear' };

        networkService.broadcast(data);
    };

    return <div style={{ display: 'grid', height: '100dvh', gridTemplateRows: '1fr 7fr' }}>
        <button style={buttonStyle} onClick={() => broadcastClear()}>🗑️</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ display: 'grid' }}>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.SPHERE, Color.RED)}>🔴</button>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.SPHERE, Color.BLUE)}>🔵</button>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.SPHERE, Color.GREEN)}>🟢</button>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.SPHERE, Color.YELLOW)}>🟡</button>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.SPHERE, Color.PURPLE)}>🟣</button>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.SPHERE, Color.ORANGE)}>🟠</button>
            </div>
            <div style={{ display: 'grid' }}>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.BOX, Color.RED)}>🟥</button>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.BOX, Color.BLUE)}>🟦</button>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.BOX, Color.GREEN)}>🟩</button>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.BOX, Color.YELLOW)}>🟨</button>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.BOX, Color.PURPLE)}>🟪</button>
                <button style={buttonStyle} onClick={() => broadcastObject(Shape.BOX, Color.ORANGE)}>🟧</button>
            </div>
        </div>
    </div>;
};

export default ToddlerCompanionApp;
