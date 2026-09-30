import React from 'react';
import { Link } from 'react-router-dom';
import MotionReveal from '../../motion/MotionReveal.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import './WhatWeOffer.css';

const OFFERS = [
  {
    to: '/career-assessment',
    icon: 'clock',
    n: '01',
    slot: 'p1',
    title: 'Career assessment',
    description: 'Map aptitude, interest and personality to the right stream.',
    tone: 'blue',
  },
  {
    to: '/kcet-predictor',
    icon: 'cap',
    n: '02',
    slot: 'p2',
    title: 'KCET predictor',
    description: 'See Safe, Moderate and Dream colleges from live cutoffs.',
    tone: 'orange',
  },
  {
    to: '/pgcet-predictor',
    icon: 'doc',
    n: '03',
    slot: 'p3',
    title: 'PGCET predictor',
    description: 'Match postgraduate courses by rank, category and preference.',
    tone: 'blue',
  },
  {
    to: '/college-compare',
    icon: 'scale',
    n: '04',
    slot: 'p4',
    title: 'College compare',
    description: 'Weigh fees, courses and rankings side by side before you shortlist.',
    tone: 'orange',
  },
  {
    to: '/college-admission-enquiry',
    icon: 'diamond',
    n: '05',
    slot: 'p5',
    title: 'Admission support',
    description: 'Counsellor follow-through on documents, enquiries and joining.',
    tone: 'blue',
  },
  {
    to: '/contact',
    icon: 'chat',
    n: '06',
    slot: 'p6',
    title: 'Expert guidance',
    description: 'One-on-one mentorship to turn results into a clear decision.',
    tone: 'orange',
  },
];

function OfferCard({ offer }) {
  return (
    <Link
      to={offer.to}
      className={`mmc-orbit-card mmc-orbit-card--${offer.slot} mmc-orbit-card--${offer.tone}`}
      aria-label={`${offer.title}. ${offer.description}`}
    >
      <span className="mmc-orbit-icon" aria-hidden="true">
        <OutlineIcon name={offer.icon} size={18} />
      </span>
      <span className="mmc-orbit-n">{offer.n}</span>
      <strong className="mmc-orbit-title">{offer.title}</strong>
      <span className="mmc-orbit-text">{offer.description}</span>
      <span className="mmc-orbit-go" aria-hidden="true">
        <OutlineIcon name="arrow" size={13} />
      </span>
    </Link>
  );
}

function OrbitHub() {
  return (
    <div className="mmc-orbit-hub">
      <svg className="mmc-orbit-hub-svg" viewBox="0 0 300 300" role="img" aria-label="Map My Career 360">
        <circle cx="150" cy="150" r="146" fill="#6d5644" />
        <circle cx="150" cy="150" r="128" fill="#ffffff" />
        <circle cx="150" cy="150" r="121" fill="none" stroke="#1a6fbe" strokeWidth="9" />
        <circle cx="150" cy="150" r="110" fill="#ffffff" />
        <path
          d="M58 128C68 62 132 42 214 74"
          fill="none"
          stroke="#1b74c9"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <text
          x="150"
          y="168"
          textAnchor="middle"
          fill="#102944"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="78"
          fontWeight="800"
          letterSpacing="-3"
        >
          360
        </text>
        <text
          x="150"
          y="196"
          textAnchor="middle"
          fill="#f57c00"
          fontFamily="Segoe Script, Brush Script MT, cursive"
          fontSize="22"
        >
          Map My Career
        </text>
      </svg>
      <div className="mmc-orbit-badge" aria-hidden="true">
        <span>MAP</span>
        <strong>360°</strong>
      </div>
    </div>
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
        </MotionReveal>

        <div className="mmc-orbit">
          <svg className="mmc-orbit-lines" viewBox="0 0 1100 680" aria-hidden="true" preserveAspectRatio="none">
            <path d="M550 108 A372 232 0 0 0 550 572" fill="none" stroke="#9ec8ea" strokeWidth="1.6" strokeDasharray="5 7" />
            <path d="M550 108 A372 232 0 0 1 550 572" fill="none" stroke="#f3c48d" strokeWidth="1.6" strokeDasharray="5 7" />
            <line x1="322" y1="86" x2="448" y2="214" stroke="#7eb6e6" strokeWidth="1.6" strokeDasharray="5 6" />
            <line x1="300" y1="332" x2="392" y2="330" stroke="#f0b15a" strokeWidth="1.6" strokeDasharray="5 6" />
            <line x1="322" y1="574" x2="448" y2="448" stroke="#7eb6e6" strokeWidth="1.6" strokeDasharray="5 6" />
            <line x1="778" y1="86" x2="652" y2="214" stroke="#f0b15a" strokeWidth="1.6" strokeDasharray="5 6" />
            <line x1="800" y1="332" x2="708" y2="330" stroke="#7eb6e6" strokeWidth="1.6" strokeDasharray="5 6" />
            <line x1="778" y1="574" x2="652" y2="448" stroke="#f0b15a" strokeWidth="1.6" strokeDasharray="5 6" />
          </svg>

          <OrbitHub />

          {OFFERS.map((offer) => (
            <OfferCard key={offer.to} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}
