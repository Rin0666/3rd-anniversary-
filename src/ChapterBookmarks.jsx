import React, { useEffect, useState } from 'react';
import { chapters } from './content';

export default function ChapterBookmarks() {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const sections = chapters.map(chapter => document.getElementById(`chapter-${chapter.id}`));
    let frame;
    const update = () => {
      const line = window.innerHeight * 0.4;
      const index = sections.findIndex(section => {
        const box = section?.getBoundingClientRect();
        return box && box.top <= line && box.bottom > line;
      });
      setActive(index >= 0 ? chapters[index].id : null);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return <nav className="chapter-bookmarks" aria-label="Chapter bookmarks" hidden={!active}>
    {chapters.map((chapter, index) => <a key={chapter.id} href={`#chapter-${chapter.id}`}
      aria-label={`Chapter ${index + 1}: ${chapter.name}`} aria-current={active === chapter.id ? 'location' : undefined}>
      <span className="bookmark-year">YEAR</span><span className="bookmark-number">{chapter.roman}</span>
    </a>)}
  </nav>;
}
