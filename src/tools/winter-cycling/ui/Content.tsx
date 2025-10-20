import { Rider, Save } from "../data/Save";
import { SubmissionStatus, Tab } from "./Home";
import Settings from "./Settings";
import Submission from "./Submission";

interface ContentProps {
    selectedTab: Tab;
    save: Save;
    onSaveChange: (save: Save) => void;
    onSubmit: (rider: Rider, distance: number, temperature: number) => void;
    submissionStatus: SubmissionStatus;
}

const Content: React.FC<ContentProps> = ({ selectedTab, save, onSaveChange, onSubmit, submissionStatus }) => {
    switch (selectedTab) {
        case Tab.SUBMISSION:
            return <Submission save={save} onSaveChange={onSaveChange} onSubmit={onSubmit} submissionStatus={submissionStatus} />;
        case Tab.LEADERBOARD:
            return <div style={{ padding: '15px' }}>🏅 Leaderboard coming soon!</div>
        case Tab.LOG:
            return <div style={{ padding: '15px' }}>🗒️ Logbook coming soon!</div>;
        case Tab.SETTINGS:
            return <Settings save={save} onSaveChange={onSaveChange} />;
    }
};

export default Content;
