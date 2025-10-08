import React, { useState, useEffect } from 'react';
import { getProxiedImageUrl } from '../services/newsService';

interface ProxiedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

const ProxiedImage: React.FC<ProxiedImageProps> = ({ src, alt, ...props }) => {
  const proxiedSrc = getProxiedImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(proxiedSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) {
        const newProxiedSrc = getProxiedImageUrl(src);
        setCurrentSrc(newProxiedSrc);
    } else {
        setCurrentSrc('');
    }
    setHasError(false);
  }, [src]);

  const handleError = () => {
    // If proxied URL fails, try original URL
    if (currentSrc === proxiedSrc && src !== proxiedSrc) {
      setCurrentSrc(src);
    } else {
      // If original URL also fails (or was the same as proxied), show placeholder
      setHasError(true);
    }
  };

  if (hasError || !currentSrc) {
    // This is the placeholder
    return (
      <div {...props} className={`${props.className || ''} bg-gray-200 flex items-center justify-center`}>
        <svg className="w-10 h-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return <img src={currentSrc} alt={alt} onError={handleError} {...props} />;
};

export default ProxiedImage;
