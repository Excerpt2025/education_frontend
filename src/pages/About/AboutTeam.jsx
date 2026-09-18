import React from 'react';
import MotionReveal from '../../motion/MotionReveal.jsx';
import ScrollCard from '../../motion/ScrollCard.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import { TEAM } from './aboutContent.js';

export default function AboutTeam() {
  return (
    <section className="mmc-about-team">
      <div className="container">
        <MotionReveal className="mmc-about-team-head">
          <p className="mmc-section-eyebrow">The desk</p>
          <h2>
            <AnimatedText>People behind the map</AnimatedText>
          </h2>
          <p>Counsellors and operators who stay with students through every step.</p>
        </MotionReveal>
        <div className="mmc-about-team-grid mmc-scroll-stage">
          {TEAM.map((member, i) => (
            <ScrollCard key={member.name} index={i} className={`mmc-about-person mmc-about-person--${member.tone}`}>
              <span className="mmc-about-person-badge">
                <OutlineIcon name="handshake" size={14} />
                {member.detail}
              </span>
              <div className={`mmc-about-person-photo mmc-about-person-photo--${member.tone}`}>
                {member.initials}
              </div>
              <strong>{member.name}</strong>
              <span>{member.role}</span>
            </ScrollCard>
          ))}
        </div>
      </div>
    </section>
  );
}
