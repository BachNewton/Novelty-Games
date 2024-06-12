const MusicPlayer: React.FC = () => {
    return <div style={{ width: 'fit-content', transform: 'translate(-100px, -100px)', height: '50px' }}>
        <div style={{ position: 'absolute', height: '152px', width: '256px', backgroundColor: 'rgba(0, 0, 255, 0.5)' }}></div>
        <div style={{ position: 'absolute', height: '108px', width: '300px', backgroundColor: 'rgba(0, 255, 0, 0.5)' }}></div>
        <div style={{ position: 'absolute', right: '0', height: '152px', width: '12px', backgroundColor: 'rgba(0, 0, 255, 0.5)' }}></div>
        <div style={{ position: 'absolute', bottom: '-102px', right: 0, height: '12px', width: '300px', backgroundColor: 'rgba(0, 255, 0, 0.5)' }}></div>
        <iframe style={{ borderWidth: 0, height: '152px', width: '300px' }} allow='encrypted-media' src="https://open.spotify.com/embed/track/2dfVmL735QprXvy95NzxRn?theme=0" />
    </div>;
};

export default MusicPlayer;
