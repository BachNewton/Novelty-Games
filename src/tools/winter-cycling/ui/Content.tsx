import { Ride } from "../data/Ride";
import { Rider, Save } from "../data/Save";
import { SubmissionStatus, Tab } from "./Home";
import Log from "./Log";
import Settings from "./Settings";
import Submission from "./Submission";

interface ContentProps {
    selectedTab: Tab;
    save: Save;
    onSaveChange: (save: Save) => void;
    onSubmit: (rider: Rider, distance: number, temperature: number) => void;
    submissionStatus: SubmissionStatus;
    rides: Ride[];
    resetSubmissionStatus: () => void;
}

const Content: React.FC<ContentProps> = ({ selectedTab, save, onSaveChange, onSubmit, submissionStatus, rides, resetSubmissionStatus }) => {
    switch (selectedTab) {
        case Tab.SUBMISSION:
            return <Submission save={save} onSaveChange={onSaveChange} onSubmit={onSubmit} submissionStatus={submissionStatus} resetSubmissionStatus={resetSubmissionStatus} />;
        case Tab.LEADERBOARD:
            return <div style={{ padding: '15px' }}>🏅 Leaderboard coming soon!</div>
        case Tab.LOG:
            return <Log rides={rides} save={save} />;
        case Tab.SETTINGS:
            return <Settings save={save} onSaveChange={onSaveChange} />;
    }
};

export default Content;
