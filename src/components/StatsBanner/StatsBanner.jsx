import React from 'react';
import { Link } from 'react-router-dom';
import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import './StatsBanner.css';

const STATS = [
  { value: '1000+', label: 'Students Guided' },
  { value: '150+', label: 'Partner Colleges' },
  {
    value: '2',
    label: 'Live College Predictors',
    accent: true,
    action: { to: '/kcet-predictor', text: 'Try it free' },
  },
  { value: '24/7', label: 'Counsellor Support' },
];

export default function StatsBanner() {
  return (
    <section className="mmc-stats-banner" aria-label="Platform highlights">
      <div className="container mmc-stats-banner-grid">
        {STATS.map((stat, index) => (
          <MotionReveal
            key={stat.label}
            className={`mmc-stats-item${stat.accent ? ' is-accent' : ''}`}
            delay={staggerDelay(index, 80)}
          >
            <strong>{stat.value}</strong>
            <span><AnimatedText delay={staggerDelay(index, 50)}>{stat.label}</AnimatedText></span>
            {stat.action ? (
              <Link to={stat.action.to} className="mmc-stats-chip">
                {stat.action.text} <OutlineIcon name="arrow" size={14} />
              </Link>
            ) : null}
          </MotionReveal>
        ))}
      </div>
    </section>
  );
}
