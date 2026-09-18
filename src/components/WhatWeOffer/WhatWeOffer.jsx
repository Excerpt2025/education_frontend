import React from 'react';
import { Link } from 'react-router-dom';
import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
import ScrollCard from '../../motion/ScrollCard.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import './WhatWeOffer.css';

const OFFERS = [
  {
    to: '/career-assessment',
    icon: 'compass',
    n: '01',
    title: 'Career assessment',
    description: 'Map aptitude, interest and personality to the right stream before you apply.',
    tone: 'blue',
  },
  {
    to: '/kcet-predictor',
    icon: 'cap',
    n: '02',
    title: 'KCET predictor',
    description: 'See Safe, Moderate and Dream colleges from live cutoffs in seconds.',
    tone: 'orange',
  },
  {
    to: '/pgcet-predictor',
    icon: 'book',
    n: '03',
    title: 'PGCET predictor',
    description: 'Match postgraduate courses by rank, category and preference.',
    tone: 'blue',
  },
  {
    to: '/college-compare',
    icon: 'scale',
    n: '04',
    title: 'College compare',
    description: 'Weigh fees, courses and rankings side by side before you shortlist.',
    tone: 'orange',
  },
  {
    to: '/college-admission-enquiry',
    icon: 'handshake',
    n: '05',
    title: 'Admission support',
    description: 'Counsellor follow-through on documents, enquiries and joining.',
    tone: 'blue',
  },
  {
    to: '/contact',
    icon: 'chat',
    n: '06',
    title: 'Expert guidance',
    description: 'One-on-one mentorship to turn results into a clear college decision.',
    tone: 'orange',
  },
];

const LEFT = OFFERS.slice(0, 3);
const RIGHT = OFFERS.slice(3, 6);

function OfferCard({ offer, index }) {
  return (
    <ScrollCard
      index={index}
      delay={staggerDelay(index, 80)}
      className="mmc-offer-scene"
    >
      <Link
        to={offer.to}
        className={`mmc-offer-card mmc-offer-card--${offer.tone}`}
        aria-label={`${offer.title}. ${offer.description}`}
      >
        <span className="mmc-offer-card-top">
          <span className="mmc-offer-icon" aria-hidden="true">
            <OutlineIcon name={offer.icon} size={20} />
          </span>
          <span className="mmc-offer-n">{offer.n}</span>
        </span>
        <strong className="mmc-offer-title mmc-heading-italic">
          <AnimatedText delay={staggerDelay(index, 40)}>{offer.title}</AnimatedText>
        </strong>
        <span className="mmc-offer-text">{offer.description}</span>
        <span className="mmc-offer-go">
          Explore <OutlineIcon name="arrow" size={14} />
        </span>
      </Link>
    </ScrollCard>
  );
}

export default function WhatWeOffer() {
  return (
    <section className="section mmc-offer-section" aria-labelledby="mmc-offer-heading">
      <div className="container">
        <MotionReveal className="mmc-offer-head">
          <p className="mmc-section-eyebrow mmc-heading-italic">
            <AnimatedText mark="offer">What we offer</AnimatedText>
          </p>
          <h2 id="mmc-offer-heading" className="mmc-heading-italic">
            <AnimatedText mark="admission">Tools that take you from assessment to admission</AnimatedText>
          </h2>
          <p>
            Predictors, comparison and counsellor support — arranged around the path that gets you there.
          </p>
        </MotionReveal>

        <div className="mmc-offer-orbit">
          <div className="mmc-offer-col mmc-offer-col--left">
            {LEFT.map((offer, index) => (
              <OfferCard key={offer.to} offer={offer} index={index} />
            ))}
          </div>

          <MotionReveal className="mmc-offer-hub" delay={60}>
            <div className="mmc-offer-hub-ring" aria-hidden="true" />
            <div className="mmc-offer-hub-core">
              <img
                src="/images/hero-journey-4.png"
                alt="Student progressing toward a professional career"
                loading="lazy"
              />
            </div>
            <div className="mmc-offer-hub-badge">
              <span>Map</span>
              <strong>360°</strong>
            </div>
          </MotionReveal>

          <div className="mmc-offer-col mmc-offer-col--right">
            {RIGHT.map((offer, index) => (
              <OfferCard key={offer.to} offer={offer} index={index + 3} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
