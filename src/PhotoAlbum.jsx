import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Photo from './Photo';
import useDialog from './useDialog';
import DialogBackdrop from './DialogBackdrop';

const AlbumContext = createContext(null);
export const usePhotoAlbum = () => useContext(AlbumContext);

export default function PhotoAlbum({ photos, children }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const openPhoto = useCallback(id => {
    const index = photos.findIndex(photo => photo.id === id);
    if (index >= 0) setActiveIndex(index);
  }, [photos]);
  const close = useCallback(() => setActiveIndex(null), []);
  const move = useCallback(delta => setActiveIndex(index => index === null || photos.length < 2
    ? index : (index + delta + photos.length) % photos.length), [photos.length]);
  const isOpen = activeIndex !== null;
  const closeRef = useDialog(isOpen, close);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, move]);
  const photo = isOpen ? photos[activeIndex] : null;
  return <AlbumContext.Provider value={openPhoto}>
    {children}
    <AnimatePresence>{photo && <DialogBackdrop className="photo-album-shade" onClose={close}>
      <motion.div className="photo-album" role="dialog" aria-modal="true" aria-label="Our photo album"
        initial={{ y: 18 }} animate={{ y: 0 }} exit={{ y: 12 }}>
        <button ref={closeRef} className="modal-close" onClick={close} aria-label="Close photo album"><X size={20} /></button>
        <span className="album-eyebrow">A LITTLE MOMENT, KEPT FOREVER</span>
        <figure>
          <Photo key={photo.id} src={photo.src} alt={photo.alt} eager sample={photo.sample} className="album-photo" />
          <figcaption>
            <span className="album-date">{photo.date}</span>
            <h2>{photo.title}</h2>
            <p>{photo.caption}</p>
          </figcaption>
        </figure>
        <div className="album-controls">
          <button onClick={() => move(-1)} disabled={photos.length < 2} aria-label="Previous photo"><ChevronLeft size={18} /><span>previous</span></button>
          <span role="status" aria-live="polite">Photo {activeIndex + 1} of {photos.length}</span>
          <button onClick={() => move(1)} disabled={photos.length < 2} aria-label="Next photo"><span>next</span><ChevronRight size={18} /></button>
        </div>
      </motion.div>
    </DialogBackdrop>}</AnimatePresence>
  </AlbumContext.Provider>;
}
