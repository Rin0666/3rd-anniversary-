import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Music2, Pause, Play } from 'lucide-react';
import Photo from './Photo';

export function StoryBurst({ photos, onComplete }) {
  const reducedMotion = useReducedMotion();
  const [viewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  useEffect(() => {
    const timer = window.setTimeout(onComplete, reducedMotion ? 100 : 1350);
    return () => window.clearTimeout(timer);
  }, [onComplete, reducedMotion]);
  return <div className="story-burst" aria-hidden="true">
    {!reducedMotion && photos.slice(0, 9).map((photo, index) => {
      const angle = index * Math.PI * 2 / Math.min(photos.length, 9) - Math.PI / 2;
      return <motion.figure className="story-burst-photo" key={photo.id}
        initial={{ x: 0, y: 0, rotate: (index - 4) * 5, scale: .2, opacity: 1 }}
        animate={{ x: Math.cos(angle) * (viewport.width * .75 + 130), y: Math.sin(angle) * (viewport.height * .75 + 150),
          rotate: (index % 2 ? 1 : -1) * (35 + index * 8), scale: [ .2, 1, .85 ], opacity: [1, 1, 0] }}
        transition={{ duration: 1.05, delay: index * .025, ease: [.2, .65, .3, 1], times: [0, .65, 1] }}>
        <Photo src={photo.src} alt="" eager sample={photo.sample} />
        <figcaption>{photo.title}</figcaption>
      </motion.figure>;
    })}
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
