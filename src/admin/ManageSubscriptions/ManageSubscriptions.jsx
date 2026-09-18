import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import AdminPagination from '../AdminPagination.jsx';
import '../AdminCommon.css';

const emptyPlan = { name: '', durationInDays: 30, price: 0, features: '' };

export default function ManageSubscriptions() {
  const [tab, setTab] = useState('subscriptions');
  const [plans, setPlans] = useState([]);
  const [subs, setSubs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyPlan);
  const [editingId, setEditingId] = useState(null);

  const loadPlans = () => api.get('/admin/subscription-plans').then((res) => setPlans(res.data.plans));
  const loadSubs = (p = page) => api.get('/admin/subscriptions', { params: { page: p, limit: 15 } })
    .then((res) => { setSubs(res.data.subscriptions); setPagination(res.data.pagination); });

  useEffect(() => { loadPlans(); }, []);
  useEffect(() => { if (tab === 'subscriptions') loadSubs(page); }, [tab, page]); // eslint-disable-line

  const openNew = () => { setForm(emptyPlan); setEditingId(null); setShowModal(true); };
  const openEdit = (plan) => { setForm({ ...plan, features: (plan.features || []).join(', ') }); setEditingId(plan._id); setShowModal(true); };

  const savePlan = async (e) => {
    e.preventDefault();
    const payload = { ...form, features: form.features.split(',').map((f) => f.trim()).filter(Boolean) };
    if (editingId) await api.put(`/admin/subscription-plans/${editingId}`, payload);
    else await api.post('/admin/subscription-plans', payload);
    setShowModal(false);
    loadPlans();
  };

  const deletePlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    await api.delete(`/admin/subscription-plans/${id}`);
    loadPlans();
  };

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Subscriptions</h1>
          <p>Manage subscription plans and view purchased subscriptions.</p>
        </div>
        {tab === 'plans' && <button className="btn btn-primary" onClick={openNew}>+ New Plan</button>}
      </div>

      <div className="mmc-dash-tabs" style={{ marginBottom: 20 }}>
        <button className={tab === 'subscriptions' ? 'active' : ''} onClick={() => setTab('subscriptions')}>Purchased Subscriptions</button>
        <button className={tab === 'plans' ? 'active' : ''} onClick={() => setTab('plans')}>Plans</button>
      </div>

      {tab === 'plans' ? (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Plan</th><th>Price</th><th>Duration</th><th>Features</th><th>Actions</th></tr></thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>₹{p.price}</td>
                    <td>{p.durationInDays} days</td>
                    <td>{(p.features || []).join(', ')}</td>
                    <td className="mmc-admin-actions">
                      <button className="mmc-admin-btn-edit" onClick={() => openEdit(p)}>Edit</button>
                      <button className="mmc-admin-btn-delete" onClick={() => deletePlan(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Plan</th><th>Amount</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s._id}>
                    <td>{s.student?.fullName} <br /><small>{s.student?.email}</small></td>
                    <td>{s.plan?.name}</td>
                    <td>₹{s.amountPaid}</td>
                    <td>{new Date(s.startDate).toLocaleDateString()}</td>
                    <td>{new Date(s.endDate).toLocaleDateString()}</td>
                    <td><span className={`badge ${s.status === 'active' ? 'badge-safe' : 'badge-dream'}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      {showModal && (
        <div className="mmc-admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="mmc-admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Edit Plan' : 'New Plan'}</h3>
            <form onSubmit={savePlan}>
              <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label>Price (₹)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
              <div className="form-group"><label>Duration (days)</label><input type="number" value={form.durationInDays} onChange={(e) => setForm({ ...form, durationInDays: e.target.value })} required /></div>
              <div className="form-group"><label>Features (comma separated)</label><textarea rows="3" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} /></div>
              <div className="mmc-admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
