import React from 'react';
import MotionReveal from '../../motion/MotionReveal.jsx';
import ScrollCard from '../../motion/ScrollCard.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import { STORY_PHASES, STORY_POINTS } from './aboutContent.js';

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
            <p>
              The work is one-on-one: career counselling, aptitude and psychometric assessment, stream and course selection, and college shortlisting. Each step uses the last one, so a student is not starting over at every form.
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

        <div className="mmc-about-story-notes">
          {STORY_POINTS.map((item, i) => (
            <ScrollCard key={item.title} index={i} className="mmc-about-story-note">
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </ScrollCard>
          ))}
        </div>
      </div>
    </section>
  );
}
