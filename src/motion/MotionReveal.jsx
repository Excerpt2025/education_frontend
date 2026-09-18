import React, { useEffect, useRef, useState } from 'react';

const STAGGER_MS = 70;

export default function MotionReveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  strong = false,
  immediate = false,
  className = '',
  children,
  style,
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(!!immediate);
  const [settled, setSettled] = useState(!!immediate);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      setSettled(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -48px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  useEffect(() => {
    if (!visible || settled) return;
    const duration = strong ? 620 : 480;
    const timer = window.setTimeout(() => setSettled(true), duration + delay + 40);
    return () => window.clearTimeout(timer);
  }, [visible, settled, delay, strong]);

  const classes = [
    'mmc-reveal',
    `mmc-reveal--${variant}`,
    strong ? 'mmc-reveal--strong' : '',
    visible ? 'is-in' : '',
    settled ? 'is-ready' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag
      ref={ref}
      className={classes}
      {...props}
      style={{ '--mmc-reveal-delay': `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}

export function staggerDelay(index, step = STAGGER_MS, base = 0) {
  return base + index * step;
}
