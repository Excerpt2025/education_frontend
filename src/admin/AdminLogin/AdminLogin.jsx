import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api.js';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import '../../pages/Login/Login.css';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/admin/login', form);
      login(res.data.token, res.data.admin);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mmc-auth-page">
      <div className="card mmc-auth-card">
        <img src="/images/logo.png" alt="MapMyCareer360" className="mmc-auth-logo" />
        <h2>Admin Login</h2>
        <p className="mmc-auth-sub">Restricted access - MapMyCareer360 staff only.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <p className="error-state">{error}</p>}
          <button className="btn btn-primary mmc-auth-submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
}
