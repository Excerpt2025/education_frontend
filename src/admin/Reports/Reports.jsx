import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import '../AdminCommon.css';

export default function Reports() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/admin/reports/summary').then((res) => setSummary(res.data));
  }, []);

  const exportData = async (collection) => {
    const res = await api.get(`/admin/export/${collection}`);
    const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${collection}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Monthly growth trends and data export.</p>
        </div>
      </div>

      {!summary ? <div className="loading-state">Loading...</div> : (
        <>
          <div className="card mmc-admin-card">
            <h3>Students Registered by Month</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Month</th><th>New Students</th></tr></thead>
                <tbody>{summary.studentsByMonth.map((row) => <tr key={row._id}><td>{row._id}</td><td>{row.count}</td></tr>)}</tbody>
              </table>
            </div>
          </div>

          <div className="card mmc-admin-card">
            <h3>Revenue by Month</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Month</th><th>Revenue</th></tr></thead>
                <tbody>{summary.revenueByMonth.map((row) => <tr key={row._id}><td>{row._id}</td><td>₹{row.total}</td></tr>)}</tbody>
              </table>
            </div>
          </div>

          <div className="card mmc-admin-card">
            <h3>Assessments Taken by Month</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Month</th><th>Assessments</th></tr></thead>
                <tbody>{summary.assessmentsByMonth.map((row) => <tr key={row._id}><td>{row._id}</td><td>{row.count}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="card mmc-admin-card">
        <h3>Export Data</h3>
        <p style={{ color: 'var(--mmc-muted)', fontSize: '0.88rem' }}>Exports are capped at 5,000 most-recent records per collection to keep downloads manageable.</p>
        <div className="mmc-admin-actions">
          {['students', 'payments', 'subscriptions', 'assessments', 'colleges', 'referrals'].map((c) => (
            <button key={c} className="btn btn-outline" onClick={() => exportData(c)} style={{ textTransform: 'capitalize' }}>{c}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
