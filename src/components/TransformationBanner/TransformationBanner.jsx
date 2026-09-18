import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MotionReveal from '../../motion/MotionReveal.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import './TransformationBanner.css';

const SLIDE_CARDS = [
  {
    to: '/career-assessment',
    icon: 'compass',
    title: 'Career assessment',
    text: 'Map aptitude and interest to a stream.',
    image: '/images/hero-1-desktop.webp',
  },
  {
    to: '/kcet-predictor',
    icon: 'cap',
    title: 'KCET predictor',
    text: 'Safe, moderate and dream colleges.',
    image: '/images/hero-2-desktop.webp',
  },
  {
    to: '/pgcet-predictor',
    icon: 'book',
    title: 'PGCET predictor',
    text: 'Postgraduate matches by rank.',
    image: '/images/hero-3-desktop.webp',
  },
  {
    to: '/college-compare',
    icon: 'scale',
    title: 'Compare colleges',
    text: 'Fees, courses and rankings side by side.',
    image: '/images/student-to-professional.png',
  },
  {
    to: '/college-admission-enquiry',
    icon: 'handshake',
    title: 'Admission support',
    text: 'Counsellor follow-through until you join.',
    image: '/images/hero-journey.png',
  },
];

function visibleCount() {
  if (typeof window === 'undefined') return 4;
  if (window.innerWidth <= 640) return 1;
  if (window.innerWidth <= 980) return 2;
  return 4;
}

export default function TransformationBanner() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(4);
  const maxIndex = Math.max(0, SLIDE_CARDS.length - visible);

  useEffect(() => {
    const update = () => setVisible(visibleCount());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  const next = () => setIndex((i) => (i >= maxIndex ? 0 : i + 1));

  return (
    <section className="mmc-transform section">
      <div className="container">
        <MotionReveal className="mmc-transform-slider" aria-label="Guidance tools">
          <div className="mmc-slide-toolbar">
            <button type="button" className="mmc-slide-btn" onClick={prev} aria-label="Previous slides">
              <OutlineIcon name="arrow" size={16} />
            </button>
            <button type="button" className="mmc-slide-btn" onClick={next} aria-label="Next slides">
              <OutlineIcon name="arrow" size={16} />
            </button>
          </div>

          <div className="mmc-slide-viewport">
            <div
              className="mmc-slide-track"
              style={{ '--mmc-slide-index': index }}
            >
              {SLIDE_CARDS.map((card, i) => (
                <Link to={card.to} className="mmc-slide-card" key={card.to}>
                  <img src={card.image} alt="" />
                  <span className="mmc-slide-icon">
                    <OutlineIcon name={card.icon} size={16} />
                  </span>
                  <strong>
                    <AnimatedText delay={i * 40}>{card.title}</AnimatedText>
                  </strong>
                  <small>{card.text}</small>
                </Link>
              ))}
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
