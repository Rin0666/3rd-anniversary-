import { useCallback, useEffect, useRef, useState } from 'react';
import createCanonPlayer from './canonPlayer';

export default function useCanonMusic() {
  const player = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const play = useCallback(async () => {
    try {
      if (!player.current) player.current = createCanonPlayer(setPlaying);
      await player.current.play();
      setError(false);
    } catch {
      setPlaying(false);
      setError(true);
    }
  }, []);
  const pause = useCallback(async () => {
    try { await player.current?.pause(); } catch { setPlaying(false); }
  }, []);
  useEffect(() => () => { player.current?.dispose(); player.current = null; }, []);
  return { playing, error, play, pause, toggle: playing ? pause : play };
}
