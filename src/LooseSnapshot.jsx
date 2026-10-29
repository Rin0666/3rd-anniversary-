import React from 'react';
import { motion } from 'framer-motion';
import Photo from './Photo';
import { usePhotoAlbum } from './PhotoAlbum';

export default function LooseSnapshot({ photo, reversed = false }) {
  const openPhoto = usePhotoAlbum();
  return <motion.div className="camera-roll-keepsake" initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .5 }}>
    <span className="camera-roll-heading">a little in-between</span>
    <figure style={{ '--snapshot-rotation': reversed ? '3deg' : '-3deg', '--snapshot-ratio': photo.aspectRatio || '3 / 4' }}>
      <span className="camera-roll-tape" aria-hidden="true" />
      <Photo src={photo.image} alt={photo.alt} onOpen={() => openPhoto(photo.id)} />
      <figcaption>{photo.title} <span aria-hidden="true">♡</span></figcaption>
    </figure>
    <span className="camera-roll-footnote">kept this one, too.</span>
  </motion.div>;
}
