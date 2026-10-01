import React from 'react';
import { Link } from 'react-router-dom';
import MotionReveal from '../../motion/MotionReveal.jsx';
import ScrollCard from '../../motion/ScrollCard.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import { OFFERINGS } from './aboutContent.js';

export default function AboutGallery() {
  return (
    <section className="mmc-about-gallery" aria-labelledby="mmc-gallery-heading">
      <div className="container">
        <MotionReveal className="mmc-about-gallery-head">
          <p className="mmc-section-eyebrow">What you get</p>
          <h2 id="mmc-gallery-heading">
            <AnimatedText>Assessment, KCET &amp; PGCET predictors, and admission support.</AnimatedText>
          </h2>
          <p>
            The same tools students use on MapMyCareer360. Each one is a step in the path — from stream choice to the college you join.
          </p>
        </MotionReveal>

        <div className="mmc-about-offerings">
          {OFFERINGS.map((entry, i) => (
            <ScrollCard key={entry.title} index={i} className="mmc-about-offer">
              <span className="mmc-about-offer-index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{entry.title}</h3>
              <p>{entry.text}</p>
              <Link to={entry.to}>
                {entry.action} <OutlineIcon name="arrow" size={14} />
              </Link>
            </ScrollCard>
          ))}
        </div>
      </div>
    </section>
  );
}
