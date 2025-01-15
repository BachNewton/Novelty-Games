import { createNetworkService, NetworkedApplication } from "../../util/NetworkService";
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

        networkService.saveFile({
            folderName: '../../invalidPath',
            fileName: 'temp.txt',
            content: 'this is a test'
        });

        networkService.saveFile({
            folderName: 'validPath',
            fileName: 'temp.txt',
            content: 'this is a test'
        });
    };

    return <div style={{ display: 'grid', height: '100vh', gridTemplateRows: '1fr 7fr' }}>
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
