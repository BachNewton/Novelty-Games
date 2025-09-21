import Welcome from "./Welcome";

interface MenuProps { }

const Menu: React.FC<MenuProps> = ({ }) => {
    return <div style={{ padding: '15px' }}>
        <Welcome />
    </div>;
};

export default Menu;
