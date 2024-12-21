import { createNetworkService, NetworkedApplication } from "../../util/NetworkService";
import { Color, Shape, ToddlerServerData } from "./ToddlerServerData";

const ToddlerCompanionApp: React.FC = () => {
    const networkService = createNetworkService<ToddlerServerData>(NetworkedApplication.MARBLE);

    const buttonStyle: React.CSSProperties = {
        fontSize: '3em'
    };

    const broadcastAction = (shape: Shape, color: Color) => {
        networkService.broadcast({ shape, color: color });
    };

    return <div style={{ display: 'grid', height: '100vh', gridTemplateRows: '1fr 7fr' }}>
        <button style={buttonStyle}>🗑️</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ display: 'grid' }}>
                <button style={buttonStyle} onClick={() => broadcastAction(Shape.SPHERE, Color.RED)}>🔴</button>
                <button style={buttonStyle} onClick={() => broadcastAction(Shape.SPHERE, Color.BLUE)}>🔵</button>
                <button style={buttonStyle} onClick={() => broadcastAction(Shape.SPHERE, Color.GREEN)}>🟢</button>
            </div>
            <div style={{ display: 'grid' }}>
                <button style={buttonStyle} onClick={() => broadcastAction(Shape.BOX, Color.RED)}>🟥</button>
                <button style={buttonStyle} onClick={() => broadcastAction(Shape.BOX, Color.BLUE)}>🟦</button>
                <button style={buttonStyle} onClick={() => broadcastAction(Shape.BOX, Color.GREEN)}>🟩</button>
            </div>
        </div>
    </div>;
};

export default ToddlerCompanionApp;
