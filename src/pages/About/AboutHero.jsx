import React from 'react';
import { Link } from 'react-router-dom';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';

export default function AboutHero() {
  const scrollToStory = () => {
    document.getElementById('mmc-about-story')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="mmc-about-hero" aria-label="About MapMyCareer360">
      <div className="container mmc-about-hero-stage">
        <div className="mmc-about-hero-copy">
          <p className="mmc-about-kicker">About · MapMyCareer360</p>
          <h1>
            <AnimatedText mark="generation">Empower the next generation of students.</AnimatedText>
          </h1>
          <p className="mmc-about-lead">
            MapMyCareer360 charts a clear path — assessment, KCET &amp; PGCET predictors, and admission support.
          </p>
          <div className="mmc-about-hero-actions">
            <Link to="/register" className="mmc-about-btn mmc-about-btn--orange">
              Get Started <OutlineIcon name="arrow" size={16} />
            </Link>
            <Link to="/career-assessment" className="mmc-about-btn mmc-about-btn--ghost">
              <OutlineIcon name="play" size={16} />
              Take Assessment
            </Link>
          </div>
          <button type="button" className="mmc-about-scroll" onClick={scrollToStory}>
            <span>Scroll</span>
            <OutlineIcon name="arrow" size={14} />
          </button>
        </div>

        <div className="mmc-about-hero-visual">
          <div className="mmc-about-hero-frame">
            <img src="/images/welcome.jpg" alt="" loading="eager" />
            <span className="mmc-about-hero-chip mmc-about-hero-chip--orange">Since day one</span>
            <span className="mmc-about-hero-chip mmc-about-hero-chip--blue">Karnataka first</span>
          </div>

          <MotionReveal variant="left" delay={staggerDelay(1)} className="mmc-float-card mmc-float-card--tl mmc-float">
            <div className="mmc-float-avatar mmc-float-avatar--lime">RM</div>
            <div>
              <strong>Rajeev M P</strong>
              <span>Career Counsellor</span>
            </div>
          </MotionReveal>

          <MotionReveal variant="right" delay={staggerDelay(2)} className="mmc-float-card mmc-float-card--tr mmc-float">
            <div className="mmc-float-avatar mmc-float-avatar--teal">RK</div>
            <div>
              <strong>Rakshith Kumar</strong>
              <span>Admissions Head</span>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
