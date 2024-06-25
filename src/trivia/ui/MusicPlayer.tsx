import '../css/MusicPlayer.css';

interface MusicPlayerProps {
    id: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ id }) => {
    const src = `https://open.spotify.com/embed/track/${id}?theme=0`;

    return <div style={{ width: 'fit-content', transform: 'translate(-120px, -100px)', height: '50px' }}>
        <div className="blocker" style={{ height: '152px', width: '254px' }}></div>
        <div className="blocker" style={{ height: '108px', width: '300px' }}></div>
        <div className="blocker" style={{ right: '0', height: '152px', width: '12px' }}></div>
        <div className="blocker" style={{ bottom: '-102px', right: 0, height: '8px', width: '300px' }}></div>
        <iframe style={{ borderWidth: 0, height: '152px', width: '300px' }} allow='encrypted-media' src={src} title='Music Player' />
    </div>;
};

export default MusicPlayer;
