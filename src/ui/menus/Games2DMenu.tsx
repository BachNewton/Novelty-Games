import SubMenu from '../SubMenu';
import * as R from '../../routes/routes';

const Games2DMenu: React.FC = () => {
    return (
        <SubMenu
            header='2D Games'
            menuItems={[
                { buttonText: 'Carnival', to: R.CARNIVAL },
                { buttonText: 'Wigglers', to: R.WIGGLERS },
                { buttonText: 'Cat', to: R.CAT },
                { buttonText: 'Platformer', to: R.PLATFORMER },
                { buttonText: 'RPG', to: R.RPG },
                { buttonText: 'Snake', to: R.SNAKE }
            ]}
        />
    );
};

export default Games2DMenu;
