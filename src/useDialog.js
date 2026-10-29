import { useEffect, useRef } from 'react';

export default function useDialog(isOpen, onClose) {
  const closeRef = useRef(null);
  const priorFocus = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!isOpen) return;
    priorFocus.current = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    const scrollPosition = { left: window.scrollX, top: window.scrollY };
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    const keyDown = event => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key === 'Tab') {
        const modal = closeRef.current?.closest('[role="dialog"]');
        if (!modal) return;
        const nodes = [...modal.querySelectorAll('button:not([disabled]),a[href],video[controls]')];
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', keyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('keydown', keyDown);
      priorFocus.current?.focus?.({ preventScroll: true });
      window.scrollTo({ ...scrollPosition, behavior: 'instant' });
    };
  }, [isOpen]);
  return closeRef;
}
