import React, { useEffect, useState } from 'react';
import { Heart, ZoomIn } from 'lucide-react';

export default function Photo({ src, alt, className = '', eager = false, children, sample = false, onOpen }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return <div className={'photo ' + className}>
    {src && !broken ? <img src={src} alt={alt || 'Romantic photograph'} loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined} decoding="async" onError={() => setBroken(true)} />
      : <div className="photo-fallback"><Heart size={30} strokeWidth={1} /><span>Add your photo</span></div>}
    {sample && <span className="sample-tag">SAMPLE PHOTO</span>}
    {onOpen && <button type="button" className="photo-open" onClick={onOpen} aria-label={`View photo: ${alt}`}>
      <span className="photo-open-hint" aria-hidden="true"><ZoomIn size={15} /> a closer look</span>
    </button>}
    {children}
  </div>;
}
