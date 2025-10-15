import { Save } from "../data/Save";
import Submission from "./Submission";

interface ContentProps {
    selectedTab: number;
    save: Save;
    onSaveChange: (save: Save) => void;
}

const Content: React.FC<ContentProps> = ({ selectedTab, save, onSaveChange }) => {
    switch (selectedTab) {
        case 0:
            return <Submission />;
        case 1:
            return <div style={{ padding: '15px' }}>🏅 Leaderboard coming soon!</div>
        case 2:
            return <div style={{ padding: '15px' }}>🗒️ Logbook coming soon!</div>;
        case 3:
            return <div style={{ padding: '15px' }}>⚙️ Settings coming soon!</div>;
        default:
            throw new Error("Invalid tab index" + selectedTab);
    }
};

export default Content;
