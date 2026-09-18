import React from 'react';
import MotionReveal from '../../motion/MotionReveal.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';

export default function Vision() {
  return (
    <section className="mmc-about-mv mmc-about-mv--vision" aria-labelledby="mmc-vision-heading">
      <div className="container mmc-about-mv-panel mmc-about-mv-panel--flip">
        <MotionReveal className="mmc-about-mv-copy">
          <p className="mmc-section-eyebrow">Our Vision</p>
          <h2 id="mmc-vision-heading">
            <AnimatedText>Bridge potential and opportunity.</AnimatedText>
          </h2>
          <p>
            MapMyCareer360 charts a clear path — assessment, KCET &amp; PGCET predictors, and admission support.
          </p>
          <ul className="mmc-about-mv-points mmc-about-mv-points--orange">
            <li>Clear stream mapping</li>
            <li>College shortlists that fit</li>
            <li>Support until you join</li>
          </ul>
        </MotionReveal>
        <MotionReveal variant="right" className="mmc-about-mv-media">
          <img src="/images/mission.jpg" alt="" loading="lazy" />
          <span className="mmc-about-mv-badge mmc-about-mv-badge--orange">Vision</span>
        </MotionReveal>
      </div>
    </section>
  );
}
