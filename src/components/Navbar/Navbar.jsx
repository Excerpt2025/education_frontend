import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.classList.add('mmc-menu-open');
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.dataset.scrollY = String(scrollY);
    } else {
      const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
      document.body.classList.remove('mmc-menu-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      delete document.body.dataset.scrollY;
      window.scrollTo(0, scrollY);
    }
  }, [open]);

  const authButtons = (
    <>
      {student ? (
        <>
          <NavLink to="/dashboard" className="mmc-nav-login" onClick={close}>Dashboard</NavLink>
          <button type="button" className="mmc-nav-cta" onClick={handleLogout}>Log out</button>
        </>
      ) : (
        <>
          <NavLink to="/register" onClick={close} className="mmc-nav-login">Sign up</NavLink>
          <NavLink to="/login" onClick={close} className="mmc-nav-cta">Log In</NavLink>
        </>
      )}
    </>
  );

  return (
    <>
      <header className="mmc-navbar">
        <div className="container mmc-navbar-inner">
          <Link to="/" className="mmc-brand" onClick={close}>
            <img
              src="/images/logo.png"
              alt="MapMyCareer360"
              className={`mmc-brand-img ${logoLoaded ? 'is-loaded' : ''}`}
              onLoad={() => setLogoLoaded(true)}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </Link>

          <nav className={`mmc-nav-links ${open ? 'open' : ''}`}>
            <NavLink to="/" end onClick={close}>Home</NavLink>
            <NavLink to="/about" onClick={close}>About</NavLink>
            <NavLink to="/services" onClick={close}>Services</NavLink>
            <NavLink to="/blog" onClick={close}>Blog</NavLink>
            <NavLink to="/contact" onClick={close}>Contact</NavLink>
            <Link
              to={student ? '/dashboard' : '/register'}
              className="mmc-nav-referral"
              onClick={close}
            >
              Refer a friend
            </Link>
            <div className="mmc-nav-auth mmc-nav-mobile-only">{authButtons}</div>
          </nav>

          <div className="mmc-nav-auth mmc-nav-desktop-only">{authButtons}</div>

          <button
            className={`mmc-burger ${open ? 'open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {open && <div className="mmc-nav-backdrop" onClick={close} />}
    </>
  );
}
