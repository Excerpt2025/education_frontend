import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import HeroHome from '../../components/HeroHome/HeroHome.jsx';
import TransformationBanner from '../../components/TransformationBanner/TransformationBanner.jsx';
import WhatWeOffer from '../../components/WhatWeOffer/WhatWeOffer.jsx';
import CollegeSpotlight from '../../components/CollegeSpotlight/CollegeSpotlight.jsx';
import SubscriptionPopup from '../../components/SubscriptionPopup/SubscriptionPopup.jsx';
import ProfileSetupPopup from '../../components/ProfileSetupPopup/ProfileSetupPopup.jsx';
import StatsCounter from '../../components/StatsCounter/StatsCounter.jsx';
import StatsBanner from '../../components/StatsBanner/StatsBanner.jsx';
import CareerJourney from '../../components/CareerJourney/CareerJourney.jsx';
import StudentReviews from '../../components/StudentReviews/StudentReviews.jsx';
import MotionReveal from '../../motion/MotionReveal.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import useMotionPointer from '../../motion/useMotionPointer.js';

import './Home.css';


export default function Home() {
  const rootRef = useRef(null);
  useMotionPointer(rootRef);

  return (
    <div className="mmc-home" ref={rootRef}>
      <SubscriptionPopup />
      {/* Appears a few seconds after the subscription popup is out of the way.
          Change `delay` (ms) to make it show sooner or later. */}
      <ProfileSetupPopup delay={6000} />
      <HeroHome />
      <StatsCounter />

      <CareerJourney />
      <WhatWeOffer />
      <CollegeSpotlight />
      <StatsBanner />
      <StudentReviews />

      <section className="mmc-cta-band">
        <div className="container mmc-cta-band-inner">
          <MotionReveal strong>
            <h2><AnimatedText>Ready to map your career?</AnimatedText></h2>
            <p>Start with a free assessment. Launch plans are ₹1.</p>
          </MotionReveal>
          <MotionReveal delay={90}>
            <Link to="/register" className="btn btn-ink">Get started free <OutlineIcon name="arrow" size={16} /></Link>
          </MotionReveal>
        </div>
      </section>
    </div>
  );
}