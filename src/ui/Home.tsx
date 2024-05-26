import './css/Home.css';

const APP_VERSION = 'v1.1.1';

const Home: React.FC = () => {
    return (
        <div>
            <code id='version-label'>{APP_VERSION}</code>
        </div>
    );
};

export default Home;
