import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api.js';
import '../Login/Login.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = request, 2 = reset
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestReset = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage('A reset link has been generated. In production this would be emailed/SMS-ed to you.');
      if (res.data.resetToken) setResetToken(res.data.resetToken); // dev convenience
      setStep(2);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      await api.post('/auth/reset-password', { resetToken, newPassword });
      setMessage('Password updated successfully! You can now log in.');
    } catch (err) {
      setError('Reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mmc-auth-page">
      <div className="card mmc-auth-card">
        <img src="/images/logo.png" alt="MapMyCareer360" className="mmc-auth-logo" />
        <h2>Reset Password</h2>
        <p className="mmc-auth-sub">
          {step === 1 ? 'Enter your registered email to receive a reset link.' : 'Enter the reset token and your new password.'}
        </p>

        {step === 1 ? (
          <form onSubmit={requestReset}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {error && <p className="error-state">{error}</p>}
            <button className="btn btn-primary mmc-auth-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword}>
            <div className="form-group">
              <label>Reset Token</label>
              <input value={resetToken} onChange={(e) => setResetToken(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            {error && <p className="error-state">{error}</p>}
            {message && <p className="mmc-success-msg">{message}</p>}
            <button className="btn btn-primary mmc-auth-submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="mmc-auth-links">
          <span><Link to="/login">Back to Login</Link></span>
        </div>
      </div>
    </div>
  );
}
