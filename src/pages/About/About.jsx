import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import StatsCounter from '../../components/StatsCounter/StatsCounter.jsx';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import MotionReveal from '../../motion/MotionReveal.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import useMotionPointer from '../../motion/useMotionPointer.js';
import AboutHero from './AboutHero.jsx';
import OurStory from './OurStory.jsx';
import Mission from './Mission.jsx';
import Vision from './Vision.jsx';
import AboutGallery from './AboutGallery.jsx';
import AboutTeam from './AboutTeam.jsx';
import '../../components/HeroHome/HeroHome.css';
import '../Home/Home.css';
import './About.css';

export default function About() {
  const rootRef = useRef(null);
  useMotionPointer(rootRef);

  return (
    <div className="mmc-about" ref={rootRef}>
      <AboutHero />
      <StatsCounter />
      <OurStory />
      <Mission />
      <Vision />
      <AboutGallery />
      <AboutTeam />
     

      <section className="mmc-cta-band">
        <div className="container mmc-cta-band-inner">
          <MotionReveal strong>
            <h2>
              <AnimatedText>Ready to map your career?</AnimatedText>
            </h2>
            <p>Start with a free assessment. Launch plans are ₹1.</p>
          </MotionReveal>
          <MotionReveal delay={90}>
            <Link to="/register" className="btn btn-ink">
              Get started free <OutlineIcon name="arrow" size={16} />
            </Link>
          </MotionReveal>
        </div>
      </section>
    </div>
  );
}
