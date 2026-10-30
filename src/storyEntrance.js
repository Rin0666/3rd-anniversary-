// The opening gets one gentle, interruptible scroll. Normal story navigation
// continues to use the browser's scrolling behavior.
export default function startStoryEntrance(onReady) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let finished = false;
  const requested = window.location.hash.slice(1);
  const destination = (requested && requested !== 'home' && document.getElementById(requested)) || document.getElementById('overview');
  const focusDestination = () => {
    destination?.setAttribute('tabindex', '-1');
    destination?.focus({ preventScroll: true });
  };
  const removeListeners = () => {
    window.removeEventListener('wheel', interrupt);
    window.removeEventListener('touchstart', interrupt);
    window.removeEventListener('pointerdown', interrupt);
    window.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('visibilitychange', onVisibility);
    preference.removeEventListener('change', onPreference);
  };
  const finish = (focus = false) => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    removeListeners();
    if (focus) focusDestination();
    onReady();
  };
  const interrupt = () => finish();
  const onKeyDown = event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Tab'].includes(event.key)) interrupt();
  };
  const onVisibility = () => { if (document.hidden) interrupt(); };
  const onPreference = () => { if (preference.matches) jumpToStory(); };
  const targetTop = () => {
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const top = destination ? window.scrollY + destination.getBoundingClientRect().top - padding : window.scrollY;
    return Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
  };
  const jumpToStory = () => {
    window.scrollTo({ top: targetTop(), behavior: 'instant' });
    finish(true);
  };
  if (preference.matches) {
    frame = requestAnimationFrame(jumpToStory);
  } else {
    const from = window.scrollY;
    const start = performance.now() + 150;
    const animate = now => {
      const progress = Math.max(0, Math.min(1, (now - start) / 2000));
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: from + (targetTop() - from) * eased, behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(animate);
      else finish(true);
    };
    window.addEventListener('wheel', interrupt, { passive: true });
    window.addEventListener('touchstart', interrupt, { passive: true });
    window.addEventListener('pointerdown', interrupt, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibility);
    preference.addEventListener('change', onPreference);
    frame = requestAnimationFrame(animate);
  }
  return () => {
    finished = true;
    cancelAnimationFrame(frame);
    removeListeners();
  };
}
