import React from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';

export default function DialogBackdrop({ children, onClose, className = '' }) {
  const reducedMotion = useReducedMotion();
  // Animate only the backdrop color. Fading a shared parent makes solid paper
  // and photographs translucent; a portal also escapes page stacking contexts.
  return createPortal(<motion.div className={`modal-shade ${className}`}
    initial={{ backgroundColor: 'rgba(21, 12, 23, 0)' }}
    animate={{ backgroundColor: 'rgba(21, 12, 23, 0.89)' }}
    exit={{ backgroundColor: 'rgba(21, 12, 23, 0)' }}
    transition={{ duration: reducedMotion ? 0 : 0.2 }}
    onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    {children}
  </motion.div>, document.body);
}
