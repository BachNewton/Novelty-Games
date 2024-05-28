import React, { useState, useEffect } from 'react';

const HEIGHT = '29vh';

interface AsyncImageProps {
    src: string;
    disableImages: boolean;
    onClick: () => void;
}

const AsyncImage: React.FC<AsyncImageProps> = ({ src, disableImages, onClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);

        if (disableImages) return;

        const image = new Image();
        image.onload = () => setIsLoaded(true);
        image.src = src;

        return () => {
            image.onload = null; // Cleanup to avoid memory leaks
        };
    }, [src, disableImages]);

    if (disableImages) {
        return <div><br /></div>;
    } else {
        const content = isLoaded
            ? <img src={src} style={{ height: HEIGHT, maxWidth: '100vw', objectFit: 'contain' }} />
            : <>Loading Image...<br /><br />(Click to disable)</>;

        return <div
            style={{ height: HEIGHT, width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onClick={onClick}>
            {content}
        </div>;
    }
};

export default AsyncImage;
