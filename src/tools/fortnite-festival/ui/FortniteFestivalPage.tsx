import { useMemo } from 'react';
import Home, { getFestivalSongs } from './Home';

const FortniteFestivalPage: React.FC = () => {
    const loadingSongs = useMemo(() => getFestivalSongs(), []);

    return <Home loadingSongs={loadingSongs} />;
};

export default FortniteFestivalPage;
