import React from 'react';
import { Link } from 'react-router-dom';
import { JOURNEY_THUMBS } from './journeyThumbs.js';
import './SectionAsideVisual.css';

export default function SectionAsideVisual({ variant = 'mosaic' }) {
  return (
    <div className={`mmc-aside-visual mmc-aside-visual--${variant}`} aria-label="From confusion to professional">
      {JOURNEY_THUMBS.map((item, index) => (
        <Link
          key={item.label}
          to={item.to}
          className={`mmc-aside-tile mmc-aside-tile--${index + 1}`}
          style={{ '--mmc-aside-i': index }}
          aria-label={item.label}
        >
          <img src={item.src} alt="" loading="lazy" />
          
        </Link>
      ))}
    </div>
  );
}
