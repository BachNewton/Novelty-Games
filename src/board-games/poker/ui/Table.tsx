import { Table as TableData } from "./Home";
import PokerTable from './PokerTable';

interface TableProps {
    hostGame: boolean;
    data: TableData;
}

const Table: React.FC<TableProps> = ({ hostGame, data }) => {
    return <div>
        <PokerTable />
    </div>;
};

export default Table;
