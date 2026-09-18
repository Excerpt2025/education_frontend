import React from 'react';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import './WhatsAppButton.css';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.link/czgq77"
      target="_blank"
      rel="noreferrer"
      className="mmc-whatsapp-float"
      aria-label="Chat with us on WhatsApp"
    >
      <OutlineIcon name="whatsapp" size={28} />
      <span className="mmc-whatsapp-tooltip">Chat with a counsellor</span>
    </a>
  );
}
