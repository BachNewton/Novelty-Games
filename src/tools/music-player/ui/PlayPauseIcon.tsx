const SIZE = '3.5em';

export enum State { PLAY, PAUSE, LOADING }

interface PlayPauseIconProps {
    state: State;
}

const PlayPauseIcon: React.FC<PlayPauseIconProps> = ({ state }) => {
    return <svg
        xmlns="http://www.w3.org/2000/svg"
        height={SIZE}
        viewBox="0 -960 960 960"
        width={SIZE}
        fill="var(--novelty-orange)"
    >
        {getPath(state)}
    </svg>;
};

function getPath(state: State): JSX.Element {
    switch (state) {
        case State.PLAY:
            return <path d="M289.23-295.38v-369.24h40v369.24h-40Zm135.39 0L733.08-480 424.62-664.62v369.24Zm40-72.54v-224.16L651.92-480l-187.3 112.08Zm0-112.08Z" />;
        case State.PAUSE:
            return <path d="M540-240v-480h180v480H540Zm-300 0v-480h180v480H240Zm340-40h100v-400H580v400Zm-300 0h100v-400H280v400Zm0-400v400-400Zm300 0v400-400Z" />;
        case State.LOADING:
            return <path d="M220-350.46v-259.08L405.38-480 220-350.46ZM540-340v-280h40v280h-40Zm160 0v-280h40v280h-40Z" />;
    }
}

export default PlayPauseIcon;
