import React, { useEffect, useState } from 'react';
import { Heart, ZoomIn } from 'lucide-react';

export default function Photo({ src, alt, className = '', eager = false, children, sample = false, onOpen, position, drift = false, fadeIn = false }) {
  const [broken, setBroken] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState(null);
  useEffect(() => setBroken(false), [src]);

  const revealImage = (event) => {
    const image = event.currentTarget;
    // Decode before revealing so a slow device never flashes an undecoded frame.
    const markReady = () => setLoadedSrc(src);
    if (typeof image.decode === 'function') {
      void image.decode().then(markReady, markReady);
    } else {
      markReady();
    }
  };

  return <div className={'photo ' + className} data-scroll-depth={drift ? 'photo' : undefined}
    data-image-ready={fadeIn ? String(loadedSrc === src) : undefined}>
    {src && !broken ? <img src={src} alt={alt || 'Romantic photograph'} loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined} decoding="async" style={position ? { objectPosition: position } : undefined} onLoad={fadeIn ? revealImage : undefined} onError={() => setBroken(true)} />
      : <div className="photo-fallback"><Heart size={30} strokeWidth={1} /><span>Add your photo</span></div>}
    {sample && <span className="sample-tag">SAMPLE PHOTO</span>}
    {onOpen && <button type="button" className="photo-open" onClick={onOpen} aria-label={`View photo: ${alt}`}>
      <span className="photo-open-hint" aria-hidden="true"><ZoomIn size={15} /> a closer look</span>
    </button>}
    {children}
  </div>;
}
