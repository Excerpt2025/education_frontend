import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/api.js';
import './CollegeAdmissionEnquiry.css';

export default function CollegeAdmissionEnquiry() {
  const [params] = useSearchParams();
  const code = params.get('ref') || '';
  const [referralInfo, setReferralInfo] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState({ loading: false, sent: false, error: '' });

  useEffect(() => {
    if (code) {
      api.get(`/college-referral/${code}`).then((res) => setReferralInfo(res.data.referral)).catch(() => {});
    }
  }, [code]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, sent: false, error: '' });
    try {
      if (code) {
        await api.post(`/college-referral/${code}/enquire`, form);
      } else {
        await api.post('/contact', { ...form, message: `[College Admission Enquiry] ${form.message}` });
      }
      setStatus({ loading: false, sent: true, error: '' });
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch {
      setStatus({ loading: false, sent: false, error: 'Something went wrong. Please try again.' });
    }
  };

  return (
    <div className="mmc-college-enquiry-page">
      <div className="page-hero">
        <div className="container">
          <h1>College Admission Enquiry</h1>
          <p>Our counselling team will personally guide you through the admission process.</p>
        </div>
      </div>

      <section className="section">
        <div className="container mmc-enquiry-container">
          {referralInfo && referralInfo.college && (
            <div className="card mmc-referral-college-note">
              You were referred regarding <strong>{referralInfo.college.name}</strong>.
            </div>
          )}
          <form className="card mmc-enquiry-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tell us what you're looking for</label>
              <textarea rows="4" name="message" value={form.message} onChange={handleChange} placeholder="e.g. Engineering admission guidance for KCET rank 4500" required />
            </div>
            {status.error && <p className="error-state">{status.error}</p>}
            {status.sent && <p className="mmc-success-msg">Thank you! Our team will reach out to you shortly.</p>}
            <button className="btn btn-primary" disabled={status.loading}>{status.loading ? 'Submitting...' : 'Submit Enquiry'}</button>
          </form>
        </div>
      </section>
    </div>
  );
}
