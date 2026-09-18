import React, { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './motionPrefs.js';

export default function CenterFlow({ className = '' }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`mmc-center-flow${active ? ' is-on' : ''} ${className}`.trim()}
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 400" fill="none">
        <circle className="mmc-flow-ring" cx="200" cy="200" r="46" />
        <circle className="mmc-flow-ring mmc-flow-ring--2" cx="200" cy="200" r="92" />
        <circle className="mmc-flow-ring mmc-flow-ring--3" cx="200" cy="200" r="148" />
        <g className="mmc-flow-dots" style={{ transformOrigin: '200px 200px' }}>
          <circle cx="200" cy="84" r="2.4" />
          <circle cx="292" cy="132" r="2" />
          <circle cx="316" cy="220" r="2.2" />
          <circle cx="248" cy="308" r="1.8" />
          <circle cx="148" cy="304" r="2.1" />
          <circle cx="84" cy="208" r="1.9" />
          <circle cx="108" cy="128" r="2.2" />
        </g>
      </svg>
    </div>
  );
}
