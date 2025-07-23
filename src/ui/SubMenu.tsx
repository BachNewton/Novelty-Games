import HomeButton from "./HomeButton";

interface SubMenuProps {
    onHomeButtonClicked: () => void;
    header: string;
    menuItems: MenuItem[];
}

interface MenuItem {
    buttonText: string;
    onClick: () => void;
}

const SubMenu: React.FC<SubMenuProps> = ({ onHomeButtonClicked, header, menuItems }) => {
    const containerStyle: React.CSSProperties = {
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100dvh',
        flexDirection: 'column'
    };

    const buttonStyle: React.CSSProperties = {
        width: '75%',
        fontSize: '1.5em',
        margin: '15px',
        padding: '15px',
        borderRadius: '25px'
    };

    const menuItemsUi = menuItems.map((menuItem, index) => {
        return <button key={index} style={buttonStyle} onClick={menuItem.onClick}>{menuItem.buttonText}</button>;
    });

    return <div style={containerStyle}>
        <HomeButton onClick={onHomeButtonClicked} />
        <div style={{ fontSize: '1.75em', marginBottom: '30px' }}>{header}</div>
        {menuItemsUi}
    </div>;
};

export default SubMenu;
