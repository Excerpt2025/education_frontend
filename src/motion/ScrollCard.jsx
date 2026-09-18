import React, { useEffect, useRef, useState } from 'react';
import './scrollCard.css';

const DIRECTIONS = ['left', 'right', 'down', 'up'];

export default function ScrollCard({
  as: Tag = 'div',
  index = 0,
  delay,
  className = '',
  children,
  style,
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [settled, setSettled] = useState(false);
  const direction = DIRECTIONS[Math.abs(index) % DIRECTIONS.length];
  const stagger = delay ?? index * 90;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      setSettled(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || settled) return undefined;
    const timer = window.setTimeout(() => setSettled(true), 760 + stagger);
    return () => window.clearTimeout(timer);
  }, [visible, settled, stagger]);

  const classes = [
    'mmc-scroll-card',
    `mmc-scroll-card--${direction}`,
    visible ? 'is-in' : '',
    settled ? 'is-ready' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag
      ref={ref}
      className={classes}
      style={{ '--mmc-card-delay': `${stagger}ms`, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function cardDirection(index) {
  return DIRECTIONS[Math.abs(index) % DIRECTIONS.length];
}
