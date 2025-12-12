import SubMenu from '../SubMenu';
import * as R from '../../routes/routes';

const MobileGamesMenu: React.FC = () => {
    return (
        <SubMenu
            header='Mobile Games'
            menuItems={[
                { buttonText: 'Free Market', to: R.FREE_MARKET },
                { buttonText: 'Pets', to: R.PETS },
                { buttonText: 'Toddler Treasure Hunt', to: R.TODDLER_TREASURE_HUNT }
            ]}
        />
    );
};

export default MobileGamesMenu;
