import React from 'react';

import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import ErrorBoundary from '../../components/ErrorBoundary.jsx';
import ContactForm from './ContactForm.jsx';
import SplineScene from './SplineScene.jsx';
import Faq from './Faq.jsx';

import './Contact.css';

const REACH = [
  {
    icon: 'pin',
    href: null,
    label: 'Kasturi Nagar, Bangalore',
  },
  {
    icon: 'phone',
    href: 'tel:+919008804368',
    label: '+91 90088 04368',
  },
  {
    icon: 'phone',
    href: 'tel:+916366018352',
    label: '+91 63660 18352',
  },
  {
    icon: 'mail',
    href: 'mailto:info@mapmycareer360.com',
    label: 'info@mapmycareer360.com',
  },
  {
    icon: 'whatsapp',
    href: 'https://wa.link/czgq77',
    label: 'WhatsApp a counsellor',
    external: true,
  },
];

/**
 * SafeIcon: guards against OutlineIcon throwing when it doesn't recognise a
 * given `name` (this is what was crashing the whole page — check
 * OutlineIcon.jsx's icon map for "pin" and "whatsapp" entries; one of them
 * is very likely missing or set to '' instead of a component/null).
 * Once OutlineIcon.jsx is fixed at the source, this wrapper is optional but
 * harmless to leave in as a safety net.
 */
function SafeIcon({ name, size }) {
  return (
    <ErrorBoundary fallback={<span className="mmc-icon-fallback" aria-hidden="true" />}>
      <OutlineIcon name={name} size={size} />
    </ErrorBoundary>
  );
}

function Contact() {
  return (
    <div className="mmc-contact-page">
      <section className="container mmc-contact-shell">

        <MotionReveal className="mmc-contact-head">
          <p className="mmc-section-eyebrow">
            Contact us
          </p>

          <h1>
            <AnimatedText>
              Contact Us
            </AnimatedText>
          </h1>

          <p>
            Have a question or want to know more?
            We'd love to hear from you.
          </p>
        </MotionReveal>

        <div className="mmc-contact-split">

          <MotionReveal
            className="mmc-contact-visual"
            delay={90}
          >
            <SplineScene />
          </MotionReveal>

          <MotionReveal
            className="mmc-contact-panel"
            delay={140}
          >
            <ContactForm />
          </MotionReveal>

        </div>

        <ul className="mmc-contact-reach">
          {REACH.map((item, index) => (
            <MotionReveal
              as="li"
              key={`${item.label}-${index}`}
              delay={staggerDelay(index, 50, 80)}
            >
              <SafeIcon name={item.icon} size={16} />

              {item.href ? (
                <a
                  href={item.href}
                  {...(
                    item.external
                      ? {
                          target: '_blank',
                          rel: 'noreferrer',
                        }
                      : {}
                  )}
                >
                  {item.label}
                </a>
              ) : (
                <span>
                  {item.label}
                </span>
              )}
            </MotionReveal>
          ))}
        </ul>

        <MotionReveal delay={160}>
          <Faq />
        </MotionReveal>

      </section>
    </div>
  );
}

export default Contact;