import React from 'react';
import MotionReveal from '../../motion/MotionReveal.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';

export default function BlogHeader() {
  return (
    <MotionReveal as="header" className="mmc-blog-hero" strong>
      <p className="mmc-section-eyebrow mmc-heading-italic">
        <AnimatedText mark="Blog">Blog</AnimatedText>
      </p>
      <h1 className="mmc-heading-italic">
        <AnimatedText mark="students">Guidance notes for students and parents</AnimatedText>
      </h1>
      <p>Short reads on assessments, predictors, and admissions from the MapMyCareer360 team.</p>
    </MotionReveal>
  );
}
