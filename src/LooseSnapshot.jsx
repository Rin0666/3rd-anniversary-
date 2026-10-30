import React from 'react';
import { ScrapbookReveal } from './CinematicScroll';
import Photo from './Photo';
import { usePhotoAlbum } from './PhotoAlbum';

export default function LooseSnapshot({ photo, reversed = false }) {
  const openPhoto = usePhotoAlbum();
  return <ScrapbookReveal className="camera-roll-keepsake">
    <span className="camera-roll-heading">a little in-between</span>
    <figure style={{ '--snapshot-rotation': reversed ? '3deg' : '-3deg', '--snapshot-ratio': photo.aspectRatio || '3 / 4' }}>
      <span className="camera-roll-tape" aria-hidden="true" />
      <Photo drift src={photo.image} alt={photo.alt} onOpen={() => openPhoto(photo.id)} />
      <figcaption>{photo.title} <span aria-hidden="true">♡</span></figcaption>
    </figure>
    <span className="camera-roll-footnote">kept this one, too.</span>
  </ScrapbookReveal>;
}
