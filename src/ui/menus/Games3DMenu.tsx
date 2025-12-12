import SubMenu from '../SubMenu';
import * as R from '../../routes/routes';

const Games3DMenu: React.FC = () => {
    return (
        <SubMenu
            header='3D Games'
            menuItems={[
                { buttonText: 'Marble', to: R.MARBLE },
                { buttonText: 'Toddler Companion App', to: R.TODDLER_COMPANION },
                { buttonText: 'Knight', to: R.KNIGHT },
                { buttonText: 'Fortuna', to: R.FORTUNA }
            ]}
        />
    );
};

export default Games3DMenu;
