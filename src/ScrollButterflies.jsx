import React, { useEffect, useRef } from 'react';

const butterflies = [
  { size: 32, color: '#dcb3c9', lane: .26, duration: 8500 },
  { size: 25, color: '#e6c48c', lane: .58, duration: 10000 },
  { size: 29, color: '#c5b6d9', lane: .4, duration: 9200 },
];

export default function ScrollButterflies() {
  const layerRef = useRef(null);
  useEffect(() => {
    const layer = layerRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop = () => {};
    const setup = () => {
      stop();
      stop = () => {};
      [...layer.children].forEach(node => { node.style.opacity = '0'; });
      if (preference.matches) return;
      let width = window.innerWidth;
      let height = window.innerHeight;
      let previousScroll = window.scrollY;
      let lastLaunch = -Infinity;
      let lastScroll = -Infinity;
      let directionDown = true;
      let frame = null;
      const flights = butterflies.map((butterfly, index) => ({ ...butterfly, node: layer.children[index], active: false }));

      const animate = now => {
        let flying = false;
        flights.forEach((flight, index) => {
          if (!flight.active) return;
          let progress = (now - flight.started) / flight.duration;
          if (progress >= 1) {
            // A finished flight should not make the butterflies disappear
            // while the visitor is still actively scrolling.
            if (now - lastScroll < 1200) {
              flight.started = now;
              flight.fromLeft = directionDown;
              progress = 0;
            } else {
              flight.active = false;
              flight.node.style.opacity = '0';
              return;
            }
          }
          flying = true;
          const distance = width + flight.size * 3;
          const x = flight.fromLeft ? -flight.size * 1.5 + progress * distance : width + flight.size * 1.5 - progress * distance;
          const y = height * flight.lane + Math.sin(progress * Math.PI * 3 + index) * 30 - Math.sin(progress * Math.PI) * 45;
          const tilt = Math.sin(progress * Math.PI * 4 + index) * 12;
          flight.node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg)`;
          flight.node.style.opacity = String(Math.max(0, Math.min(1, progress / .08, (1 - progress) / .12)) * .8);
        });
        frame = flying ? requestAnimationFrame(animate) : null;
      };

      const onScroll = () => {
        const delta = window.scrollY - previousScroll;
        previousScroll = window.scrollY;
        const now = performance.now();
        if (!delta || document.hidden) return;
        lastScroll = now;
        directionDown = delta > 0;
        if (now - lastLaunch < 700) return;
        const available = width <= 700 ? flights.slice(0, 2) : flights;
        const flight = available.find(item => !item.active);
        if (!flight) return;
        Object.assign(flight, { active: true, started: now, fromLeft: delta > 0 });
        lastLaunch = now;
        if (frame === null) frame = requestAnimationFrame(animate);
      };
      const clear = () => {
        cancelAnimationFrame(frame);
        frame = null;
        flights.forEach(flight => { flight.active = false; flight.node.style.opacity = '0'; });
        previousScroll = window.scrollY;
        lastLaunch = -Infinity;
        lastScroll = -Infinity;
      };
      const resize = () => { clear(); width = window.innerWidth; height = window.innerHeight; };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', resize);
      document.addEventListener('visibilitychange', clear);
      stop = () => {
        clear();
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', resize);
        document.removeEventListener('visibilitychange', clear);
      };
    };
    setup();
    preference.addEventListener('change', setup);
    return () => { stop(); preference.removeEventListener('change', setup); };
  }, []);

  return <div className="scroll-butterflies" ref={layerRef} aria-hidden="true">
    {butterflies.map((butterfly, index) => <span className="scroll-butterfly" key={index}
      style={{ width: `${butterfly.size}px`, '--wing-color': butterfly.color, opacity: 0 }}>
      <svg viewBox="0 0 48 40" fill="none" focusable="false">
        <g className="butterfly-wings">
          <path d="M23 21C13 1 1 0 4 13C4 18 10 22 17 23C3 15 1 28 12 33C18 36 22 29 23 23Z" fill="var(--wing-color)" stroke="#927386" strokeWidth=".7" />
          <path d="M25 21C35 1 47 0 44 13C44 18 38 22 31 23C45 15 47 28 36 33C30 36 26 29 25 23Z" fill="var(--wing-color)" stroke="#927386" strokeWidth=".7" />
          <path d="M8 10L20 21M8 27L20 25M40 10L28 21M40 27L28 25" stroke="#f9eadb" strokeWidth="1.2" opacity=".8" />
        </g>
        <path d="M24 16V29M24 17C18 8 18 10 17 9M24 17C30 8 30 10 31 9" stroke="#6d5768" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>)}
  </div>;
}
