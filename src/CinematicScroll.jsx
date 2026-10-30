import React, { useEffect, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { memoryInterludes } from './content';

const ease = [0.22, 1, 0.36, 1];
const motionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = callback => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
const readMotion = () => window.matchMedia(motionQuery).matches;
const readServerMotion = () => true;

// This Framer Motion version snapshots the preference on mount. Subscribe
// directly so changing the OS setting also stops an already-open story.
function useMotionPreference() {
  return useSyncExternalStore(subscribeMotion, readMotion, readServerMotion);
}

export function ScrapbookReveal({ as = 'div', delay = 0, lift = true, children, ...props }) {
  const reduced = useMotionPreference();
  const Element = motion[as];
  return <Element {...props} initial={reduced ? false : { opacity: 0, ...(lift ? { y: 18 } : {}) }}
    whileInView={{ opacity: 1, ...(lift ? { y: 0 } : {}) }} viewport={{ once: true, amount: .12 }}
    transition={{ duration: reduced ? 0 : .8, delay: reduced ? 0 : delay, ease }}>
    {children}
  </Element>;
}

export function MemoryInterlude({ index }) {
  const interlude = memoryInterludes[index];
  return <aside className={`memory-interlude interlude-${index}`} aria-label="Between our chapters">
    <ScrapbookReveal>
      <span className="interlude-thread" aria-hidden="true" />
      <span className="eyebrow">{interlude.eyebrow}</span>
      <p>{interlude.text}</p>
      <span className="interlude-heart" aria-hidden="true">♡</span>
    </ScrapbookReveal>
  </aside>;
}

export function ChapterScenery() {
  return <div className="chapter-scenery" data-scroll-depth="scenery" aria-hidden="true">
    <i className="scenery-haze" /><i className="scenery-orbit" /><i className="scenery-petal" />
  </div>;
}

// One scroll listener for the story. Only visible scenery is measured, and
// animation writes happen after every layout read to avoid layout thrashing.
export function useCinematicScroll(enabled) {
  const reduced = useMotionPreference();
  useEffect(() => {
    if (!enabled || reduced) return;
    const elements = [...document.querySelectorAll('main [data-scroll-depth]')];
    const visible = new Set();
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (document.hidden) return;
      const height = window.innerHeight;
      const positions = [...visible].map(element => {
        const rect = element.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / ((height + rect.height) / 2)));
        return [element, progress, Math.min(9, rect.height * .025)];
      });
      positions.forEach(([element, progress, photoRange]) => {
        element.style.setProperty('--photo-drift', `${(progress * photoRange).toFixed(2)}px`);
        element.style.setProperty('--scenery-drift', `${(progress * 24).toFixed(2)}px`);
      });
    };
    const schedule = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(paint); };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
        entry.target.toggleAttribute('data-depth-active', entry.isIntersecting);
      });
      schedule();
    }, { rootMargin: '80px' });
    elements.forEach(element => observer.observe(element));
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else schedule();
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', onVisibility);
      elements.forEach(element => {
        element.removeAttribute('data-depth-active');
        element.style.removeProperty('--photo-drift');
        element.style.removeProperty('--scenery-drift');
      });
    };
  }, [enabled, reduced]);
}
