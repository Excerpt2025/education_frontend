import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import '../AdminCommon.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data.stats)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>A quick snapshot of MapMyCareer360's activity.</p>
        </div>
      </div>

      {!stats ? (
        <div className="loading-state">Loading stats...</div>
      ) : (
        <div className="mmc-admin-stats-grid">
          <div className="card mmc-admin-stat"><span>Total Students</span><strong>{stats.studentCount}</strong></div>
          <div className="card mmc-admin-stat"><span>Active Subscriptions</span><strong>{stats.activeSubscriptions}</strong></div>
          <div className="card mmc-admin-stat"><span>Total Assessments Taken</span><strong>{stats.totalAssessments}</strong></div>
          <div className="card mmc-admin-stat"><span>Total Revenue</span><strong>₹{stats.totalRevenue}</strong></div>
          <div className="card mmc-admin-stat"><span>Pending Referrals</span><strong>{stats.pendingReferrals}</strong></div>
          <div className="card mmc-admin-stat"><span>Open College Enquiries</span><strong>{stats.openCollegeReferrals}</strong></div>
        </div>
      )}

      <div className="card mmc-admin-card">
        <h3>Quick Tips</h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--mmc-muted)', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <li>Upload previous-year cutoff data under <strong>Predictor Data → KCET/PGCET Cutoff Data</strong> via Excel for fast bulk import.</li>
          <li>Add colleges under <strong>Catalog → Colleges</strong> before uploading cutoff sheets that reference them (or let the uploader auto-create them by name).</li>
          <li>Update the homepage slider under <strong>Website Content → Slider / Banners</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
