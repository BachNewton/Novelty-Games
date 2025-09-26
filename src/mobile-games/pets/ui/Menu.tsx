import Welcome from "./Welcome";

interface MenuProps {
    selection: MenuOption;
}

export enum MenuOption {
    WELCOME, OVERVIEW
}

const Menu: React.FC<MenuProps> = ({ selection }) => {
    return <div style={{ padding: '15px' }}>
        {contentUi(selection)}
    </div>;
};

function contentUi(selection: MenuOption): JSX.Element {
    switch (selection) {
        case MenuOption.WELCOME:
            return <Welcome />;
        case MenuOption.OVERVIEW:
            return <div>Overview</div>;
    }
}

export default Menu;
