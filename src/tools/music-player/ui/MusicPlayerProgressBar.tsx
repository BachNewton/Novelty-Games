import ProgressBar from "../../../util/ui/ProgressBar";

interface MusicPlayerProgressBarProps {
    state: ProgressState | null;
}

export interface ProgressState {
    text: string;
}

export class AddingSongsState implements ProgressState {
    text: string;
    current: number;
    total: number;

    constructor(current: number, total: number) {
        this.text = `Adding songs to database... (${current}/${total})`;
        this.current = current;
        this.total = total;
    }
}

export class CompleteState implements ProgressState {
    text: string;

    constructor() {
        this.text = 'All done!';
    }
}

export class SelectingFolderState implements ProgressState {
    text: string;

    constructor() {
        this.text = 'Selecting folder...';
    }
}

export class FolderSelectedState implements ProgressState {
    text: string;

    constructor() {
        this.text = 'Folder selected...';
    }
}

export class DatabaseOpenedState implements ProgressState {
    text: string;

    constructor() {
        this.text = 'Database opened...';
    }
}

export class AddSongsToDatabaseState implements ProgressState {
    text: string;
    progress: number;

    constructor(progress: number) {
        this.text = 'Adding songs to database...';
        this.progress = progress;
    }
}

export class DatabaseTransactionCompleteState implements ProgressState {
    text: string;

    constructor() {
        this.text = 'Database transaction complete...';
    }
}

const MusicPlayerProgressBar: React.FC<MusicPlayerProgressBarProps> = ({ state }) => {
    if (state === null) return <></>;

    return <div style={{ margin: '0px 5px 10px' }}>
        <div style={{ marginBottom: '10px', fontSize: '0.8em' }}>
            {state.text}
        </div>
        <ProgressBar progress={getProgress(state)} />
    </div>;
};

function getProgress(state: ProgressState): number {
    if (state instanceof SelectingFolderState) {
        return 0;
    } else if (state instanceof FolderSelectedState) {
        return 0.2;
    } else if (state instanceof DatabaseOpenedState) {
        return 0.4;
    } else if (state instanceof AddSongsToDatabaseState) {
        // Map progress (0 to 1) to range 0.4 to 0.8
        return 0.4 + state.progress * 0.4;
    } else if (state instanceof DatabaseTransactionCompleteState) {
        return 1;
    } else if (state instanceof AddingSongsState) {
        return state.current / state.total;
    } else if (state instanceof CompleteState) {
        return 1;
    } else {
        return 0;
    }
}

export default MusicPlayerProgressBar;
