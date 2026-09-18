import React from 'react';
import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
import './Testimonials.css';

const STORIES = [
  {
    name: 'Ananya R.',
    role: 'Engineering · Bangalore',
    title: 'KCET made simple',
    text: 'The predictor showed exactly which colleges were realistic — Safe, Moderate, Dream.',
    tag: 'KCET',
  },
  {
    name: 'Rahul K.',
    role: 'PGCET aspirant',
    title: 'Counsellor + predictor',
    text: 'Together they saved weeks of guesswork on PGCET shortlists.',
    tag: 'PGCET',
  },
  {
    name: 'Sneha M.',
    role: 'Career assessment',
    title: 'Assessment that fits',
    text: 'The career test matched what Sneha actually enjoyed in college.',
    tag: 'Assessment',
  },
];

export default function Testimonials() {
  return (
    <section className="section mmc-testimonials-section">
      <div className="container">
        <MotionReveal className="mmc-stories-head">
          <p className="mmc-stories-kicker">Student stories</p>
          <h2>Map your admission path from start to finish</h2>
        </MotionReveal>

        <div className="mmc-stories-list">
          {STORIES.map((story, i) => (
            <MotionReveal as="article" className="mmc-story-row" key={story.name} delay={staggerDelay(i, 60)}>
              <span className="mmc-story-avatar">{story.name.slice(0, 1)}</span>
              <div className="mmc-story-copy">
                <strong>{story.title}</strong>
                <p>{story.text}</p>
                <small>{story.name} · {story.role}</small>
              </div>
              <em>{story.tag}</em>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
