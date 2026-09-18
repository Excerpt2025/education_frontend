import { useEffect } from 'react';
import { hasFinePointer, prefersReducedMotion } from './motionPrefs.js';

export default function useMotionPointer(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion() || !hasFinePointer()) return undefined;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      root.style.setProperty('--mmc-px', currentX.toFixed(3));
      root.style.setProperty('--mmc-py', currentY.toFixed(3));
      const done = Math.abs(targetX - currentX) < 0.002 && Math.abs(targetY - currentY) < 0.002;
      frame = done ? 0 : window.requestAnimationFrame(tick);
    };

    const onMove = (event) => {
      const rect = root.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;
      targetX = ((event.clientX - rect.left) / width) * 2 - 1;
      targetY = ((event.clientY - rect.top) / height) * 2 - 1;
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [rootRef]);
}
