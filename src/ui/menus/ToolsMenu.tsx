import SubMenu from '../SubMenu';
import * as R from '../../routes/routes';

const ToolsMenu: React.FC = () => {
    return (
        <SubMenu
            header='🔧 Tools 🔨'
            menuItems={[
                { buttonText: 'Music Player 🎶', to: R.MUSIC_PLAYER },
                { buttonText: 'Fortnite Festival Difficulty Rankings 🎛️', to: R.FORTNITE_FESTIVAL },
                { buttonText: 'Database Debug 📦', to: R.DATABASE_DEBUG },
                { buttonText: 'Winter Cycling ❄️', to: R.WINTER_CYCLING },
                { buttonText: 'Fractal Explorer 🌀', to: R.FRACTAL_EXPLORER },
                { buttonText: 'Prime Number Finder 🔢', to: R.PRIME_FINDER }
            ]}
        />
    );
};

export default ToolsMenu;
