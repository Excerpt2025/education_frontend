import React from 'react';
import MotionReveal from '../../motion/MotionReveal.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';

export default function Mission() {
  return (
    <section className="mmc-about-mv mmc-about-mv--mission" aria-labelledby="mmc-mission-heading">
      <div className="container mmc-about-mv-panel">
        <MotionReveal variant="left" className="mmc-about-mv-media">
          <img src="/images/vision.jpg" alt="" loading="lazy" />
          <span className="mmc-about-mv-badge">Mission</span>
        </MotionReveal>
        <MotionReveal className="mmc-about-mv-copy">
          <p className="mmc-section-eyebrow">Our Mission</p>
          <h2 id="mmc-mission-heading">
            <AnimatedText>Informed decisions, every step.</AnimatedText>
          </h2>
          <p>
            Students need direction, not guesswork. We stay with them from stream choice after 10th through college admission and placement prep.
          </p>
          <ul className="mmc-about-mv-points">
            <li>Assessment before applications</li>
            <li>Live cutoff predictors</li>
            <li>Counsellor follow-through</li>
          </ul>
        </MotionReveal>
      </div>
    </section>
  );
}
