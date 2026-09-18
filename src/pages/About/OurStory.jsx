import React from 'react';
import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
import ScrollCard from '../../motion/ScrollCard.jsx';
import ParallaxElement from '../../motion/ParallaxElement.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import { STORY_PHASES } from './aboutContent.js';

export default function OurStory() {
  return (
    <section id="mmc-about-story" className="mmc-about-story">
      <div className="container mmc-about-story-grid">
        <div>
          <MotionReveal>
            <p className="mmc-section-eyebrow">Our story</p>
            <h2>
              <AnimatedText>Guidance beyond academics.</AnimatedText>
            </h2>
            <p>
              Students need direction, not guesswork. We stay with them from stream choice after 10th through college admission and placement prep.
            </p>
          </MotionReveal>

          <ol className="mmc-about-timeline">
            {STORY_PHASES.map((item, i) => (
              <ScrollCard as="li" key={item.phase} index={i} className="mmc-about-timeline-item">
                <span className="mmc-about-timeline-index">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <em>{item.phase}</em>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </ScrollCard>
            ))}
          </ol>
        </div>

        <MotionReveal variant="right" delay={staggerDelay(2)} className="mmc-about-story-visual">
          <ParallaxElement speed={0.06}>
            <img
              src="/images/hero-journey.png"
              alt=""
              loading="lazy"
            />
          </ParallaxElement>
        </MotionReveal>
      </div>
    </section>
  );
}
