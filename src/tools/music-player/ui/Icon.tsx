export enum Type { PLAY, PAUSE, LOADING, FILTER, SEARCH }

interface IconProps {
    type: Type;
    size: number;
}

const Icon: React.FC<IconProps> = ({ type, size }) => {
    return <svg
        xmlns="http://www.w3.org/2000/svg"
        height={`${size}em`}
        viewBox="0 -960 960 960"
        width={`${size}em`}
        fill="var(--novelty-orange)"
    >
        {getPath(type)}
    </svg>;
};

function getPath(type: Type): JSX.Element {
    switch (type) {
        case Type.PLAY:
            return <path d="M289.23-295.38v-369.24h40v369.24h-40Zm135.39 0L733.08-480 424.62-664.62v369.24Zm40-72.54v-224.16L651.92-480l-187.3 112.08Zm0-112.08Z" />;
        case Type.PAUSE:
            return <path d="M540-240v-480h180v480H540Zm-300 0v-480h180v480H240Zm340-40h100v-400H580v400Zm-300 0h100v-400H280v400Zm0-400v400-400Zm300 0v400-400Z" />;
        case Type.LOADING:
            return <path d="M220-350.46v-259.08L405.38-480 220-350.46ZM540-340v-280h40v280h-40Zm160 0v-280h40v280h-40Z" />;
        case Type.FILTER:
            return <path d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z" />;
        case Type.SEARCH:
            return <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />;
    }
}

export default Icon;
