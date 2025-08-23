interface MainProps { }

const Main: React.FC<MainProps> = ({ }) => {
    return <div>This is an RPG</div>;
};

export function getOverlay(): JSX.Element {
    return <Main />;
}
