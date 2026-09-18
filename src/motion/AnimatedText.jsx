import React, { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './motionPrefs.js';

export default function AnimatedText({
  as: Tag = 'span',
  children,
  className = '',
  delay = 0,
  mark,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const text = typeof children === 'string' ? children : '';
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion()) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`mmc-anim-text${visible ? ' is-in' : ''} ${className}`.trim()}
    >
      {words.map((word, index) => {
        const isMark =
          typeof mark === 'string' &&
          word.replace(/[^\w]/g, '').toLowerCase() === mark.toLowerCase();
        return (
          <span
            key={`${word}-${index}`}
            className={`mmc-anim-word${isMark ? ' mmc-anim-word--mark' : ''}`}
            style={{
              '--mmc-word-i': index,
              '--mmc-word-delay': `${delay}ms`,
            }}
          >
            {word}
          </span>
        );
      })}
    </Tag>
  );
}
