import React, { useEffect, useRef } from "react";

const roses = Array.from({ length: 14 }, (_, index) => ({
  left: 0.05 + ((index * 0.618034) % 1) * 0.9,
  start: 0.15 + ((index * 0.381966) % 1) * 0.7,
  size: 23 + (index % 4) * 5,
  speed: 19 + (index % 5) * 3,
  phase: index * 2.4,
}));

export default function FallingRoses() {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};

    const start = () => {
      stop();
      stop = () => {};
      if (reducedMotion.matches) return;

      let width = window.innerWidth;
      let height = window.innerHeight;
      let previousScroll = window.scrollY;
      let previousTime = performance.now();
      let riseStrength = 0;
      let verticalFactor = 1;
      let fallBoost = 0;
      let direction = 1;
      let lastScrollTime = -Infinity;
      let elapsed = 0;
      let frameId;
      const margin = 80;
      const particles = roses.map((rose, index) => ({
        ...rose,
        node: layer.children[index],
        y: rose.start * height,
      }));

      const onScroll = () => {
        const nextScroll = window.scrollY;
        const delta = nextScroll - previousScroll;
        previousScroll = nextScroll;
        if (!delta) return;
        // Replace leftover momentum when the visitor changes direction.
        if (Math.sign(delta) !== direction) riseStrength = 0;
        direction = Math.sign(delta);
        if (delta > 0) {
          // Scrolling adds a small speed boost, never a jump by the page distance.
          fallBoost = Math.min(1, fallBoost + delta / 120);
        } else {
          fallBoost = 0;
          // Large upward swipes get the same gentle cap as small ones.
          riseStrength = Math.min(1, riseStrength + Math.abs(delta) / 160);
        }
        lastScrollTime = performance.now();
      };

      const animate = now => {
        // Keep the resting speed steady through slower paint frames. A short
        // cap still prevents a visible leap after a long main-thread stall;
        // visibility changes separately reset the clock when returning to a tab.
        const seconds = previousTime === null ? 0 : Math.min((now - previousTime) / 1000, 0.25);
        previousTime = now;
        elapsed += seconds;
        const fallMultiplier = 1 + fallBoost * 0.6;
        const rising = direction < 0 && now - lastScrollTime < 300;
        const targetFactor = rising ? -(.35 + riseStrength * .3) : fallMultiplier;
        verticalFactor += (targetFactor - verticalFactor) * (1 - Math.exp(-12 * seconds));
        fallBoost *= Math.exp(-3 * seconds);

        particles.forEach((rose, index) => {
          if (width <= 700 && index >= 8) return;
          rose.y += rose.speed * seconds * verticalFactor;
          // Wrap outside the viewport, including large scrollbar/anchor jumps.
          const span = height + margin * 2;
          rose.y = ((rose.y + margin) % span + span) % span - margin;
          const x = rose.left * Math.max(0, width - rose.size) + Math.sin(elapsed * 0.55 + rose.phase) * 12;
          const rotation = Math.sin(elapsed * 0.4 + rose.phase) * 25 + rose.phase * 9;
          rose.node.style.transform = `translate3d(${x}px, ${rose.y}px, 0) rotate(${rotation}deg)`;
        });
        frameId = requestAnimationFrame(animate);
      };

      const onResize = () => {
        const nextHeight = window.innerHeight;
        particles.forEach(rose => { rose.y *= nextHeight / Math.max(1, height); });
        width = window.innerWidth;
        height = nextHeight;
        previousScroll = window.scrollY;
      };

      const onVisibilityChange = () => {
        cancelAnimationFrame(frameId);
        previousTime = null;
        previousScroll = window.scrollY;
        riseStrength = 0;
        verticalFactor = 1;
        fallBoost = 0;
        lastScrollTime = -Infinity;
        if (!document.hidden) frameId = requestAnimationFrame(animate);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibilityChange);
      if (!document.hidden) frameId = requestAnimationFrame(animate);
      stop = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    };

    start();
    reducedMotion.addEventListener("change", start);
    return () => {
      stop();
      reducedMotion.removeEventListener("change", start);
    };
  }, []);

  return <div className="falling-roses" ref={layerRef} aria-hidden="true">
    {roses.map((rose, index) => <span className="falling-rose" key={index}
      style={{ "--rose-size": `${rose.size}px`, transform: `translate3d(${rose.left * 100}vw, ${rose.start * 100}vh, 0)` }}>
      <svg viewBox="0 0 40 58" fill="none" focusable="false">
        <path d="M21 24C17 35 26 43 20 55" stroke="#74816b" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M21 40C11 40 10 34 10 32C18 31 22 36 21 40Z" fill="#829079" />
        <path d="M22 47C22 38 28 35 32 36C32 43 28 47 22 47Z" fill="#65795f" />
        <path d="M20 29C10 29 4 22 7 15C4 8 11 3 18 6C24 1 33 5 32 12C39 18 31 29 20 29Z" fill="#bd627e" />
        <path d="M8 15C9 8 17 8 21 13C26 6 33 11 32 17C29 24 23 28 20 29C13 26 10 22 8 15Z" fill="#df8f9f" />
        <path d="M12 12C18 9 25 11 27 17C27 23 22 26 20 27C15 24 12 19 12 12Z" fill="#cb708b" />
        <path d="M14 15C18 10 26 13 25 18C24 22 20 23 17 20C14 17 18 14 21 16" stroke="#f5b9bf" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 18C10 23 13 26 18 27M28 20C26 25 23 27 20 28" stroke="#efa8b4" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>)}
  </div>;
}
