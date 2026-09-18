import React, { useState } from 'react';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import ErrorBoundary from '../../components/ErrorBoundary.jsx';

// Sample copy — replace with your verified services, hours, and response times.
const FAQS = [
  {
    q: 'What services does MapMyCareer360 provide?',
    a: 'We offer one-on-one career counselling, aptitude and psychometric assessments, stream and course selection guidance, and college shortlisting support for students and young professionals.',
  },
  {
    q: 'How do I book a counselling session?',
    a: "Fill out the contact form above, call us, or message us on WhatsApp. We'll get back to you to confirm a date and time that works for you.",
  },
  {
    q: 'Do you offer online consultations?',
    a: 'Yes. Sessions can be held in person at our Kasturi Nagar office or over a video call, whichever is more convenient for you.',
  },
  {
    q: 'Which age groups do you work with?',
    a: 'We work with students from Class 9 onward, as well as undergraduates and early professionals considering a career change.',
  },
  {
    q: 'What should I bring to my first session?',
    a: 'Nothing is required in advance. Sharing recent report cards, test scores, or a resume beforehand helps us tailor the discussion to you.',
  },
  {
    q: 'How soon will I hear back after submitting the form?',
    a: 'We aim to respond within one business day. For anything urgent, WhatsApp or call us directly using the details below.',
  },
];

function FaqItem({ index, question, answer, isOpen, onToggle }) {
  const buttonId = `mmc-faq-button-${index}`;
  const panelId = `mmc-faq-panel-${index}`;

  return (
    <li className={`mmc-faq-item${isOpen ? ' is-open' : ''}`}>
      <h3 className="mmc-faq-question">
        <button
          id={buttonId}
          type="button"
          className="mmc-faq-trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{question}</span>
          <span className="mmc-faq-chevron" aria-hidden="true">
            <ErrorBoundary fallback={<span className="mmc-icon-fallback" />}>
              <OutlineIcon name="arrow" size={16} />
            </ErrorBoundary>
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="mmc-faq-panel"
        hidden={!isOpen}
      >
        <p>{answer}</p>
      </div>
    </li>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="mmc-faq" aria-labelledby="mmc-faq-heading">
      <div className="mmc-faq-head">
        <p className="mmc-section-eyebrow">FAQs</p>
        <h2 id="mmc-faq-heading">Frequently asked questions</h2>
      </div>
      <ul className="mmc-faq-list">
        {FAQS.map((item, index) => (
          <FaqItem
            key={item.q}
            index={index}
            question={item.q}
            answer={item.a}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}
      </ul>
    </section>
  );
}