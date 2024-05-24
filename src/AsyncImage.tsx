import React, { useState, useEffect } from 'react';

const HEIGHT = '17vh';

interface AsyncImageProps {
    src: string;
}

const AsyncImage: React.FC<AsyncImageProps> = ({ src }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);
        const image = new Image();
        image.onload = () => setIsLoaded(true);
        image.src = src;

        return () => {
            image.onload = null; // Cleanup to avoid memory leaks
        };
    }, [src]);

    const content = isLoaded
        ? <img src={src} style={{ height: HEIGHT }} />
        : <>(Loading Coaster Image)</>;

    return <div style={{ height: HEIGHT, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{content}</div>;
};

export default AsyncImage;
