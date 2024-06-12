import '../css/MusicPlayer.css';

const MusicPlayer: React.FC = () => {
    return <div style={{ width: 'fit-content', transform: 'translate(-116px, -100px)', height: '50px' }}>
        <div className="blocker" style={{ height: '152px', width: '254px' }}></div>
        <div className="blocker" style={{ height: '108px', width: '300px' }}></div>
        <div className="blocker" style={{ right: '0', height: '152px', width: '12px' }}></div>
        <div className="blocker" style={{ bottom: '-102px', right: 0, height: '8px', width: '300px' }}></div>
        <iframe style={{ borderWidth: 0, height: '152px', width: '300px' }} allow='encrypted-media' src="https://open.spotify.com/embed/track/2dfVmL735QprXvy95NzxRn?theme=0" />
    </div>;
};

export default MusicPlayer;
