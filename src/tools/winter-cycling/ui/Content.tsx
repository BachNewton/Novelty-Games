import { Rider, Save } from "../data/Save";
import Settings from "./Settings";
import Submission from "./Submission";

interface ContentProps {
    selectedTab: number;
    save: Save;
    onSaveChange: (save: Save) => void;
    onSubmit: (rider: Rider, distance: number, temperature: number) => void;
}

const Content: React.FC<ContentProps> = ({ selectedTab, save, onSaveChange, onSubmit }) => {
    switch (selectedTab) {
        case 0:
            return <Submission save={save} onSaveChange={onSaveChange} onSubmit={onSubmit} />;
        case 1:
            return <div style={{ padding: '15px' }}>🏅 Leaderboard coming soon!</div>
        case 2:
            return <div style={{ padding: '15px' }}>🗒️ Logbook coming soon!</div>;
        case 3:
            return <Settings save={save} onSaveChange={onSaveChange} />;
        default:
            throw new Error("Invalid tab index" + selectedTab);
    }
};

export default Content;
