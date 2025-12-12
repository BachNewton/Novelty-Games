import SubMenu from '../SubMenu';
import * as R from '../../routes/routes';

const BoardGamesMenu: React.FC = () => {
    return (
        <SubMenu
            header='Board Games'
            menuItems={[
                { buttonText: 'Mille Bornes', to: R.MILLE_BORNES },
                { buttonText: 'Labyrinth', to: R.LABYRINTH },
                { buttonText: 'Monopoly', to: R.MONOPOLY },
                { buttonText: 'Poker', to: R.POKER }
            ]}
        />
    );
};

export default BoardGamesMenu;
