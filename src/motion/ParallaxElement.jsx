import React, { useEffect, useRef } from 'react';
import { hasFinePointer, prefersReducedMotion } from './motionPrefs.js';

export default function ParallaxElement({ speed = 0.08, className = '', children }) {
  const frameRef = useRef(null);
  const innerRef = useRef(null);
  const visible = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner || prefersReducedMotion() || !hasFinePointer()) return undefined;

    const apply = () => {
      raf.current = 0;
      if (!visible.current) return;
      const rect = frame.getBoundingClientRect();
      const offset = (window.innerHeight * 0.5 - (rect.top + rect.height * 0.5)) * speed;
      inner.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      if (!visible.current || raf.current) return;
      raf.current = window.requestAnimationFrame(apply);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting) onScroll();
      },
      { rootMargin: '80px 0px' }
    );

    observer.observe(frame);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (raf.current) window.cancelAnimationFrame(raf.current);
    };
  }, [speed]);

  return (
    <div ref={frameRef} className={`mmc-parallax ${className}`.trim()}>
      <div ref={innerRef} className="mmc-parallax-inner">
        {children}
      </div>
    </div>
  );
}
