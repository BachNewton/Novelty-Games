import { Table as TableData } from "./Home";

interface TableProps {
    hostGame: boolean;
    data: TableData;
}

const Table: React.FC<TableProps> = ({ hostGame, data }) => {
    return <div>Table</div>;
};

export default Table;
