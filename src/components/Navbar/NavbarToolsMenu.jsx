import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * Tools navbar dropdown — kept for future use.
 * Not rendered in Navbar currently. Re-import into Navbar.jsx to restore it.
 */
export default function NavbarToolsMenu({ onNavigate }) {
  const { pathname } = useLocation();
  const toolsActive = [
    '/career-assessment',
    '/kcet-predictor',
    '/pgcet-predictor',
    '/college-compare',
    '/subscription',
  ].includes(pathname);

  return (
    <>
      <div className="mmc-nav-dropdown mmc-nav-desktop-only">
        <button type="button" className={`mmc-nav-drop-btn${toolsActive ? ' is-active' : ''}`} aria-haspopup="true">Tools</button>
        <div className="mmc-nav-drop-menu">
          <NavLink to="/career-assessment" onClick={onNavigate}>Career Assessment</NavLink>
          <NavLink to="/kcet-predictor" onClick={onNavigate}>KCET Predictor</NavLink>
          <NavLink to="/pgcet-predictor" onClick={onNavigate}>PGCET Predictor</NavLink>
          <NavLink to="/college-compare" onClick={onNavigate}>Compare Colleges</NavLink>
          <NavLink to="/subscription" onClick={onNavigate}>Subscription</NavLink>
        </div>
      </div>
      <NavLink className="mmc-nav-mobile-only" to="/career-assessment" onClick={onNavigate}>Career Assessment</NavLink>
      <NavLink className="mmc-nav-mobile-only" to="/kcet-predictor" onClick={onNavigate}>KCET Predictor</NavLink>
      <NavLink className="mmc-nav-mobile-only" to="/pgcet-predictor" onClick={onNavigate}>PGCET Predictor</NavLink>
      <NavLink className="mmc-nav-mobile-only" to="/college-compare" onClick={onNavigate}>Compare Colleges</NavLink>
      <NavLink className="mmc-nav-mobile-only" to="/subscription" onClick={onNavigate}>Subscription</NavLink>
    </>
  );
}
