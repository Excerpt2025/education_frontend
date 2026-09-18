import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import './Footer.css';

export default function Footer() {
  const [logoLoaded, setLogoLoaded] = useState(false);

  return (
    <footer className="mmc-footer">
      <div className="container mmc-footer-row">
        <Link to="/" className="mmc-footer-brand">
          <img
            src="/images/logo.png"
            alt="MapMyCareer360"
            className={`mmc-footer-logo ${logoLoaded ? 'is-loaded' : ''}`}
            onLoad={() => setLogoLoaded(true)}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </Link>

        <nav className="mmc-footer-links">
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/kcet-predictor">KCET</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="mmc-footer-meta">
          <a href="tel:+919008804368">+91 90088 04368</a>
          <div className="mmc-footer-social">
            <a href="https://www.facebook.com/mapmycareer360/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <OutlineIcon name="facebook" size={14} />
            </a>
            <a href="https://www.instagram.com/mapmycareer360" target="_blank" rel="noreferrer" aria-label="Instagram">
              <OutlineIcon name="instagram" size={14} />
            </a>
            <a href="https://wa.link/czgq77" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <OutlineIcon name="whatsapp" size={14} />
            </a>
          </div>
        </div>
      </div>

      <div className="mmc-footer-bottom">
        <p>© {new Date().getFullYear()} MapMyCareer360</p>
        <Link to="/admin/login" className="mmc-admin-link">Admin</Link>
      </div>
    </footer>
  );
}
