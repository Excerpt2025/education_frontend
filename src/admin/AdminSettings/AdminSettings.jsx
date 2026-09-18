import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import '../AdminCommon.css';

export default function AdminSettings() {
  const { setAdmin } = useAdminAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [savedMsg, setSavedMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/me').then((res) => setForm({ name: res.data.admin.name, email: res.data.admin.email, password: '' }));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setSavedMsg('');
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const res = await api.put('/admin/me', payload);
      setAdmin(res.data.admin);
      setSavedMsg('Profile updated successfully.');
      setForm({ ...form, password: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Admin Settings</h1>
          <p>Update your admin profile and password.</p>
        </div>
      </div>

      <form className="card mmc-admin-card" onSubmit={save} style={{ maxWidth: 480 }}>
        <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="form-group"><label>New Password (leave blank to keep current)</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} /></div>
        {savedMsg && <p className="mmc-success-msg">{savedMsg}</p>}
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
}
