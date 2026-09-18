import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MotionReveal from '../../motion/MotionReveal.jsx';
import ScrollCard from '../../motion/ScrollCard.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import { GALLERY } from './aboutContent.js';

export default function AboutGallery() {
  const [active, setActive] = useState(null);

  const close = useCallback(() => setActive(null), []);

  const step = useCallback((delta) => {
    setActive((current) => {
      if (current == null) return current;
      const next = (current + delta + GALLERY.length) % GALLERY.length;
      return next;
    });
  }, []);

  useEffect(() => {
    if (active == null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [active, close, step]);

  const item = active != null ? GALLERY[active] : null;

  return (
    <section className="mmc-about-gallery" aria-labelledby="mmc-gallery-heading">
      <div className="container">
        <MotionReveal className="mmc-about-gallery-head">
          <p className="mmc-section-eyebrow">Gallery</p>
          <h2 id="mmc-gallery-heading">
            <AnimatedText>Assessment, KCET &amp; PGCET predictors, and admission support.</AnimatedText>
          </h2>
          <p>The same tools students use on MapMyCareer360.</p>
        </MotionReveal>

        <div className="mmc-about-masonry">
          {GALLERY.map((entry, i) => (
            <ScrollCard key={entry.src} index={i} className={`mmc-about-tile mmc-about-tile--${entry.span}`}>
              <button
                type="button"
                className="mmc-about-tile-btn"
                onClick={() => setActive(i)}
                aria-label={`Open ${entry.title}`}
              >
                <img src={entry.src} alt="" loading="lazy" />
                <span className="mmc-about-tile-overlay">
                  <strong>{entry.title}</strong>
                  <small>{entry.meta}</small>
                </span>
              </button>
            </ScrollCard>
          ))}
        </div>
      </div>

      {item ? (
        <div className="mmc-about-lightbox" role="dialog" aria-modal="true" aria-label={item.title}>
          <button type="button" className="mmc-about-lightbox-scrim" onClick={close} aria-label="Close gallery" />
          <div className="mmc-about-lightbox-panel">
            <img src={item.src} alt="" />
            <div className="mmc-about-lightbox-meta">
              <div>
                <strong>{item.title}</strong>
                <p>{item.meta}</p>
              </div>
              <Link to={item.to} className="mmc-hero-cta" onClick={close}>
                Open tool <OutlineIcon name="arrow" size={14} />
              </Link>
            </div>
            <div className="mmc-about-lightbox-nav">
              <button type="button" onClick={() => step(-1)} aria-label="Previous image">
                Prev
              </button>
              <button type="button" onClick={close} aria-label="Close">
                Close
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next image">
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
