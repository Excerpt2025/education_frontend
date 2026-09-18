import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import './AdminLayout.css';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/admin/dashboard', label: '📊 Dashboard' }],
  },
  {
    label: 'People',
    items: [
      { to: '/admin/students', label: '🎓 Students' },
      { to: '/admin/subscriptions', label: '💳 Subscriptions' },
    ],
  },
  {
    label: 'Assessment & Payments',
    items: [
      { to: '/admin/assessments', label: '🧭 Career Assessments' },
      { to: '/admin/career-roadmap', label: '🗺️ Career Map' },
      { to: '/admin/payments', label: '💰 Payments & Transactions' },
    ],
  },
  {
    label: 'Referrals',
    items: [
      { to: '/admin/referrals', label: '🎁 Assessment/Sub Referrals' },
      { to: '/admin/college-referrals', label: '🏫 College Referrals' },
      { to: '/admin/college-interest', label: '📋 College Interest Leads' },
    ],
  },
  {
    label: 'Predictor Data',
    items: [
      { to: '/admin/kcet-data', label: '📥 KCET Cutoff Data' },
      { to: '/admin/pgcet-data', label: '📥 PGCET Cutoff Data' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/colleges', label: '🏛️ Colleges' },
      { to: '/admin/courses', label: '📚 Courses' },
    ],
  },
  {
    label: 'Website Content',
    items: [
      { to: '/admin/sliders', label: '🖼️ Slider / Banners' },
      { to: '/admin/pages', label: '📄 Pages & Content' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/reports', label: '📈 Reports & Analytics' },
      { to: '/admin/settings', label: '⚙️ Admin Settings' },
    ],
  },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile nav whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent background scroll while the mobile nav is open.
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="mmc-admin-shell">
      {sidebarOpen && (
        <div className="mmc-admin-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`mmc-admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="mmc-admin-brand">
          <img src="/images/logo.png" alt="MapMyCareer360" />
          <button
            type="button"
            className="mmc-admin-sidebar-close"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="mmc-admin-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mmc-admin-nav-group">
              <p>{group.label}</p>
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="mmc-admin-main">
        <header className="mmc-admin-topbar">
          <div className="mmc-admin-topbar-left">
            <button
              type="button"
              className="mmc-admin-menu-btn"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
            <span className="mmc-admin-welcome">Welcome, {admin?.name || 'Admin'}</span>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </header>
        <main className="mmc-admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
