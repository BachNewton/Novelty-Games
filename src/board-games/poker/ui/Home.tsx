import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
// import { Game } from "holdem-poker";
import Button from "../../../util/ui/Button";
import { createNetworkService, NetworkedApplication } from "../../../util/networking/NetworkService";
import { createID } from "../../../util/ID";
import VerticalSpacer from "../../../util/ui/Spacer";

interface HomeProps { }

type PokerNetworkData =
    | FindTableNetworkData
    | TableNetworkData;

interface FindTableNetworkData {
    type: 'findTables';
}

interface TableNetworkData {
    type: 'table';
    table: Table;
}

interface Table {
    id: string;
    players: string[];
}

const Home: React.FC<HomeProps> = ({ }) => {
    const playerId = useRef(createID()).current;
    const networkService = useRef(createNetworkService<PokerNetworkData>(NetworkedApplication.POKER)).current;

    // const game = useRef(new Game(
    //     [100, 100],
    //     5
    // )).current;

    const [tables, setTables] = useState<Table[]>([]);
    const [table, setTable] = useState<Table | null>(null);

    const refreshTables = () => networkService.broadcast({ type: 'findTables' });

    useEffect(() => {
        updateRoute(Route.POKER);

        refreshTables();
    }, []);

    useEffect(() => {
        networkService.setNetworkEventListener(data => {
            if (data.type === 'table') {
                const isTableNew = tables === null || tables.findIndex(t => t.id === data.table.id) === -1;

                if (isTableNew) {
                    setTables([...(tables ?? []), data.table]);
                }
            } else if (data.type === 'findTables') {
                if (table === null) return;

                networkService.broadcast({ type: 'table', table: table });
            }
        });
    }, [table]);

    const createTable = () => {
        setTable({
            id: createID(),
            players: [playerId]
        });
    };

    const tablesUi = tables.map((t, index) => <div key={index}>
        <div>ID: {t.id}</div>
        <div>Players: {t.players.length}</div>
    </div>);

    return <div style={{ margin: '15px' }}>
        <div>Poker</div>

        <VerticalSpacer height='15px' />

        <div style={{ display: 'flex', gap: '5px' }}>
            <div>Tables</div>
            <div><Button onClick={refreshTables}>Refresh</Button></div>
        </div>
        {tablesUi}

        <VerticalSpacer height='15px' />

        <Button onClick={createTable}>Create Table</Button>
    </div>;
};

export default Home;
