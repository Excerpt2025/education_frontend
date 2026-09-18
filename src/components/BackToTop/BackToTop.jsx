import React, { useEffect, useState } from 'react';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import { prefersReducedMotion } from '../../motion/motionPrefs.js';
import './BackToTop.css';

const R = 18;
const CIRC = 2 * Math.PI * R;

export default function BackToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      setProgress(next);
      setVisible(window.scrollY > 360);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const goTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      className={`mmc-back-top${visible ? ' is-visible' : ''}`}
      onClick={goTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <svg className="mmc-back-top-ring" viewBox="0 0 44 44" aria-hidden="true">
        <circle className="mmc-back-top-track" cx="22" cy="22" r={R} />
        <circle
          className="mmc-back-top-fill"
          cx="22"
          cy="22"
          r={R}
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress)}
        />
      </svg>
      <OutlineIcon name="arrow" size={16} />
    </button>
  );
}
