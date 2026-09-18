import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import AdminPagination from '../AdminPagination.jsx';
import '../AdminCommon.css';

const emptyForm = { ownerName: '', ownerContact: '', college: '', hideCollegeFromReferredView: true };

export default function ManageCollegeReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [viewing, setViewing] = useState(null);

  const load = (p = page) => api.get('/admin/college-referrals', { params: { page: p, limit: 15 } })
    .then((res) => { setReferrals(res.data.referrals); setPagination(res.data.pagination); });

  useEffect(() => { load(page); }, [page]); // eslint-disable-line
  useEffect(() => { api.get('/colleges', { params: { limit: 100 } }).then((res) => setColleges(res.data.colleges || [])).catch(() => {}); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/admin/college-referrals', form);
    setShowModal(false);
    setForm(emptyForm);
    load(page);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this referral link?')) return;
    await api.delete(`/admin/college-referrals/${id}`);
    load(page);
  };

  const toggleStatus = async (ref) => {
    await api.put(`/admin/college-referrals/${ref._id}`, { status: ref.status === 'open' ? 'closed' : 'open' });
    load(page);
  };

  const linkFor = (code) => `${window.location.origin}/college-admission-enquiry?ref=${code}`;

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>College Admission Referrals</h1>
          <p>Independent referral links for college admission enquiries. College details can be hidden from the referred student's view.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Referral Link</button>
      </div>

      <div className="card">
        {referrals.length === 0 ? <div className="empty-state">No college referral links yet.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Owner</th><th>College (Hidden?)</th><th>Enquiries</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r._id}>
                    <td>{r.referralLinkCode}</td>
                    <td>{r.ownerName || '-'}<br /><small>{r.ownerContact}</small></td>
                    <td>{r.college?.name || '-'} {r.hideCollegeFromReferredView ? '🙈' : '👁️'}</td>
                    <td>
                      <button className="mmc-admin-btn-edit" onClick={() => setViewing(r)}>{r.enquiries?.length || 0} view</button>
                    </td>
                    <td><span className={`badge ${r.status === 'open' ? 'badge-safe' : 'badge-dream'}`}>{r.status}</span></td>
                    <td className="mmc-admin-actions">
                      <button className="mmc-admin-btn-edit" onClick={() => toggleStatus(r)}>{r.status === 'open' ? 'Close' : 'Reopen'}</button>
                      <button className="mmc-admin-btn-delete" onClick={() => remove(r._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination pagination={pagination} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="mmc-admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="mmc-admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>New College Admission Referral</h3>
            <form onSubmit={create}>
              <div className="form-group"><label>Owner / Counselor Name</label><input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></div>
              <div className="form-group"><label>Owner Contact</label><input value={form.ownerContact} onChange={(e) => setForm({ ...form, ownerContact: e.target.value })} /></div>
              <div className="form-group">
                <label>College</label>
                <select value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })}>
                  <option value="">None / General</option>
                  {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group mmc-checkbox-group">
                <label><input type="checkbox" checked={form.hideCollegeFromReferredView} onChange={(e) => setForm({ ...form, hideCollegeFromReferredView: e.target.checked })} /> Hide college details from the referred student's view</label>
              </div>
              <div className="mmc-admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="mmc-admin-modal-backdrop" onClick={() => setViewing(null)}>
          <div className="mmc-admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Enquiries for {viewing.referralLinkCode}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--mmc-muted)', wordBreak: 'break-all' }}>{linkFor(viewing.referralLinkCode)}</p>
            {viewing.enquiries?.length === 0 ? <div className="empty-state">No enquiries yet.</div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Phone</th><th>Message</th></tr></thead>
                  <tbody>
                    {viewing.enquiries?.map((e, i) => (
                      <tr key={i}><td>{e.name}</td><td>{e.phone}</td><td>{e.message}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mmc-admin-modal-actions">
              <button className="btn btn-outline" onClick={() => setViewing(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
