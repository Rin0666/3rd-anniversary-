import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Flower2, Heart, Music2, Pause, Play } from 'lucide-react';
import Photo from './Photo';

export function StoryBurst({ photos, onComplete }) {
  const reducedMotion = useReducedMotion();
  const [viewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const burstPhotos = Array.from({ length: photos.length ? 45 : 0 }, (_, index) => photos[index % photos.length]);
  useEffect(() => {
    const timer = window.setTimeout(onComplete, reducedMotion ? 100 : 2150);
    return () => window.clearTimeout(timer);
  }, [onComplete, reducedMotion]);
  return <div className="story-burst" aria-hidden="true">
    {!reducedMotion && burstPhotos.map((photo, index) => {
      const slot = index % 9;
      const wave = Math.floor(index / 9);
      // Five overlapping waves fan into 45 distinct directions. Reuse the
      // album images so repeated cards share the same cached photographs.
      const angle = (slot + wave / 5) * Math.PI * 2 / 9 - Math.PI / 2;
      return <motion.figure className="story-burst-photo" key={`${photo.id}-${index}`}
        initial={{ x: 0, y: 0, rotate: (slot - 4) * 5, scale: .2, opacity: 1 }}
        animate={{ x: Math.cos(angle) * (viewport.width * .75 + 130), y: Math.sin(angle) * (viewport.height * .75 + 150),
          rotate: (index % 2 ? 1 : -1) * (35 + slot * 8 + wave * 6), scale: [ .2, 1, .85 ], opacity: [1, 1, 0] }}
        transition={{ duration: 1.6, delay: wave * .06 + slot * .018, ease: [.2, .65, .3, 1], times: [0, .6, 1] }}>
        <Photo src={photo.src} alt="" eager sample={photo.sample} />
        <figcaption>{photo.title}</figcaption>
      </motion.figure>;
    })}
    {!reducedMotion && Array.from({ length: 20 }, (_, index) => {
      const angle = index * Math.PI * 2 / 20 - Math.PI / 2 + .16;
      const flower = index % 2 === 0;
      const Icon = flower ? Flower2 : Heart;
      return <motion.span key={`keepsake-${index}`} className={`story-burst-keepsake ${flower ? 'burst-flower' : 'burst-heart'}`}
        style={{ color: ['#efb6c4', '#f3d18b', '#dca4be', '#e9c5a4'][index % 4] }}
        initial={{ x: 0, y: 0, scale: .2, opacity: 0 }}
        animate={{ x: Math.cos(angle) * (viewport.width * .6 + 60), y: Math.sin(angle) * (viewport.height * .6 + 60),
          rotate: index % 2 ? 45 : -65, scale: [.2, 1.15, .7], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, delay: .06 + index * .018, ease: [.2, .65, .3, 1], times: [0, .4, 1] }}>
        <Icon size={flower ? 34 : 25} strokeWidth={1.4} />
      </motion.span>;
    })}
    {!reducedMotion && Array.from({ length: 3 }, (_, index) => <span className={`story-burst-firework burst-firework-${index}`} key={`firework-${index}`}>
      {Array.from({ length: 8 }, (_, spark) => {
        const angle = spark * Math.PI / 4;
        return <i key={spark} style={{ '--spark-x': `${Math.cos(angle) * 70}px`, '--spark-y': `${Math.sin(angle) * 70}px`,
          '--spark-angle': `${spark * 45 + 90}deg`, '--spark-delay': `${.1 + index * .12}s` }} />;
      })}
    </span>)}
  </div>;
}

export function BackgroundMusic({ music }) {
  return <div className="background-music">
    <button className="background-music-toggle" type="button" onClick={music.toggle} aria-pressed={music.playing}
      aria-label={music.playing ? 'Pause Canon in D' : 'Play Canon in D'} title={music.playing ? 'Pause Canon in D' : 'Play Canon in D'}>
      <Music2 size={18} />
      <span className="background-music-name">Canon in D <small>{music.playing ? 'playing softly' : 'paused'}</small></span>
      <span className="background-music-state" aria-hidden="true">{music.playing ? <Pause size={13} /> : <Play size={13} />}</span>
    </button>
    {music.error && <span className="music-retry" role="status">Tap the music button to try again.</span>}
  </div>;
}
