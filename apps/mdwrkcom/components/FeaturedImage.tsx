import React from 'react';

interface FeaturedImageProps {
  src: string;
  alt: string;
}

export const FeaturedImage: React.FC<FeaturedImageProps> = ({ src, alt }) => {
  return (
    <figure className="lander-featured-image">
      <img className="lander-featured-image-media" src={src} alt={alt} loading="eager" />
    </figure>
  );
};
