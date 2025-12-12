import { useNavigate } from 'react-router-dom';
import { RouteNode } from '../routes/routes';
import HomeButton from './HomeButton';

interface SubMenuProps {
    header: string;
    menuItems: MenuItem[];
}

interface MenuItem {
    buttonText: string;
    to: RouteNode;
}

const SubMenu: React.FC<SubMenuProps> = ({ header, menuItems }) => {
    const navigate = useNavigate();

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
        return (
            <button
                key={index}
                style={buttonStyle}
                onClick={() => navigate(menuItem.to.fullPath)}
            >
                {menuItem.buttonText}
            </button>
        );
    });

    return (
        <div style={containerStyle}>
            <HomeButton />
            <div style={{ fontSize: '1.75em', marginBottom: '30px' }}>{header}</div>
            {menuItemsUi}
        </div>
    );
};

export default SubMenu;
