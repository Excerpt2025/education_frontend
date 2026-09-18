import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import AdminPagination from '../AdminPagination.jsx';
import '../AdminCommon.css';

export default function ManageCollegeInterest() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (p = page) => {
    setLoading(true);
    api.get('/admin/college-interest', { params: { page: p, limit: 20, status: status || undefined } })
      .then((res) => { setLeads(res.data.leads); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]); // eslint-disable-line
  useEffect(() => { setPage(1); load(1); }, [status]); // eslint-disable-line

  const updateStatus = async (id, newStatus) => {
    await api.put(`/admin/college-interest/${id}`, { status: newStatus });
    load(page);
  };

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>College Interest Leads</h1>
          <p>Everyone who submitted the "which college are you interested in" form before comparing colleges.</p>
        </div>
      </div>

      <div className="mmc-admin-toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading-state">Loading...</div> : leads.length === 0 ? (
          <div className="empty-state">No leads yet - once students compare colleges, their contact details will show up here.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Colleges</th><th>Context</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l._id}>
                    <td>{l.name}</td>
                    <td>{l.phone}</td>
                    <td>{l.email || '-'}</td>
                    <td>{(l.colleges || []).map((c) => c.name).join(', ') || '-'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{l.context}</td>
                    <td><span className={`badge ${l.status === 'new' ? 'badge-moderate' : l.status === 'contacted' ? 'badge-safe' : 'badge-dream'}`}>{l.status}</span></td>
                    <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td className="mmc-admin-actions">
                      {l.status !== 'contacted' && <button className="mmc-admin-btn-edit" onClick={() => updateStatus(l._id, 'contacted')}>Mark Contacted</button>}
                      {l.status !== 'closed' && <button className="mmc-admin-btn-delete" onClick={() => updateStatus(l._id, 'closed')}>Close</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}
