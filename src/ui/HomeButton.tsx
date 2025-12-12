import { useNavigate } from 'react-router-dom';
import { HOME } from '../routes/routes';

const HomeButton: React.FC = () => {
    const navigate = useNavigate();

    const homeButtonStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        marginTop: '5px',
        marginLeft: '5px',
        fontSize: '1em'
    };

    return <button style={homeButtonStyle} onClick={() => navigate(HOME.fullPath)}>🏠</button>;
};

export default HomeButton;
