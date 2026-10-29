import React, { useLayoutEffect, useRef, useState } from 'react';

export default function FittedLetter({ children }) {
  const frameRef = useRef(null);
  const sceneRef = useRef(null);
  const [fit, setFit] = useState({ width: 0, height: 0, scale: 1 });

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const scene = sceneRef.current;
    const backdrop = frame.closest('.modal-shade');
    const viewport = window.visualViewport;
    let scheduled;
    let disposed = false;
    const measure = () => {
      if (disposed || (viewport && viewport.scale > 1.01)) return;
      // Safari's address bars change the visual viewport without changing the
      // screen size. Keep the complete composition inside the visible area.
      backdrop.style.setProperty('--letter-viewport-height', `${viewport?.height || window.innerHeight}px`);
      backdrop.style.setProperty('--letter-viewport-top', `${viewport?.offsetTop || 0}px`);
      const padding = getComputedStyle(backdrop);
      const availableWidth = backdrop.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight);
      const availableHeight = backdrop.clientHeight - parseFloat(padding.paddingTop) - parseFloat(padding.paddingBottom);
      const width = Math.max(1, Math.min(640, availableWidth));
      scene.style.width = `${width}px`;
      // Layout height ignores the envelope's temporary opening transforms.
      const height = scene.offsetHeight;
      if (!height) return;
      const scale = Math.min(1, availableWidth / width, availableHeight / height);
      setFit(previous => Math.abs(previous.width - width) < .5 && Math.abs(previous.height - height) < .5
        && Math.abs(previous.scale - scale) < .001 ? previous : { width, height, scale });
    };
    const schedule = () => {
      if (disposed) return;
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(measure);
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    observer?.observe(scene);
    observer?.observe(backdrop);
    window.addEventListener('resize', schedule);
    viewport?.addEventListener('resize', schedule);
    viewport?.addEventListener('scroll', schedule);
    document.fonts?.ready.then(schedule);
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(scheduled);
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
      viewport?.removeEventListener('resize', schedule);
      viewport?.removeEventListener('scroll', schedule);
    };
  }, []);

  return <div ref={frameRef} className="fitted-letter-stage" data-ready={fit.width > 0}
    style={{ width: fit.width * fit.scale, height: fit.height * fit.scale }}>
    <div ref={sceneRef} className="fitted-letter-scene" style={{ width: fit.width || undefined, transform: `scale(${fit.scale})` }}>
      {children}
    </div>
  </div>;
}
