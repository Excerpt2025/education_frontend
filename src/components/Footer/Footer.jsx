import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import './Footer.css';

export default function Footer() {
  const [logoLoaded, setLogoLoaded] = useState(false);

  return (
    <footer className="mmc-footer">
      <div className="container mmc-footer-grid">
        <div className="mmc-footer-col mmc-footer-col--nav">
          <h3 className="mmc-footer-label">Explore</h3>
          <nav className="mmc-footer-links">
            <Link to="/about">About</Link>
            <Link to="/services">Services</Link>
            <Link to="/kcet-predictor">KCET Predictor</Link>
            <Link to="/pgcet-predictor">PGCET Predictor</Link>
            <Link to="/college-compare">College Compare</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>

        <div className="mmc-footer-col mmc-footer-col--contact">
          <h3 className="mmc-footer-label">Visit us</h3>
          <address className="mmc-footer-address">
            <span className="mmc-footer-line">
              <OutlineIcon name="pin" size={16} />
              <span>Kasturi Nagar, Bangalore, Karnataka, India</span>
            </span>
            <a className="mmc-footer-line" href="tel:+919008804368">
              <OutlineIcon name="phone" size={16} />
              <span>+91 90088 04368</span>
            </a>
            <a className="mmc-footer-line" href="tel:+916366018352">
              <OutlineIcon name="phone" size={16} />
              <span>+91 63660 18352</span>
            </a>
            <a className="mmc-footer-line" href="mailto:info@mapmycareer360.com">
              <OutlineIcon name="mail" size={16} />
              <span>info@mapmycareer360.com</span>
            </a>
          </address>
        </div>

        <div className="mmc-footer-col mmc-footer-col--brand">
          <Link to="/" className="mmc-footer-brand" aria-label="MapMyCareer360 home">
            <img
              src="/images/logo.png"
              alt="MapMyCareer360"
              className={`mmc-footer-logo ${logoLoaded ? 'is-loaded' : ''}`}
              onLoad={() => setLogoLoaded(true)}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </Link>
          <p className="mmc-footer-tagline">Educate · Empower · Excel</p>
          <div className="mmc-footer-social" aria-label="Social media">
            <a href="https://www.facebook.com/mapmycareer360/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <OutlineIcon name="facebook" size={18} />
            </a>
            <a href="https://www.instagram.com/mapmycareer360" target="_blank" rel="noreferrer" aria-label="Instagram">
              <OutlineIcon name="instagram" size={18} />
            </a>
            <a href="https://wa.link/czgq77" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <OutlineIcon name="whatsapp" size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="mmc-footer-bottom">
        <p>© {new Date().getFullYear()} MapMyCareer360. All rights reserved.</p>
        <Link to="/admin/login" className="mmc-admin-link">Admin</Link>
      </div>
    </footer>
  );
}
