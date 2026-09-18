import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/api.js';
import './CollegeInterestModal.css';

export default function CollegeInterestModal({
  collegeIds,
  context,
  courseOptions,
  title,
  subtitle,
  submitLabel,
  onSuccess,
  onClose,
}) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', interestedCourse: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll while the modal is open, and restore the exact
  // scroll position on close so the page doesn't jump anywhere.
  useEffect(() => {
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prevPosition = style.position;
    const prevTop = style.top;
    const prevWidth = style.width;
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';
    return () => {
      style.position = prevPosition;
      style.top = prevTop;
      style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/college-interest', { ...form, collegeIds, context });
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="mmc-interest-modal-backdrop" onClick={onClose}>
      <div className="mmc-interest-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title || 'Just one quick step 👋'}</h3>
        <p className="mmc-interest-sub">
          {subtitle || 'Share your details so our counsellors can send you more info on these colleges - your comparison unlocks right after.'}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
          <div className="form-group"><label>Email (optional)</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          {courseOptions?.length > 0 && (
            <div className="form-group">
              <label>Interested Course (optional)</label>
              <select value={form.interestedCourse} onChange={(e) => setForm({ ...form, interestedCourse: e.target.value })}>
                <option value="">Select a course</option>
                {courseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          {error && <p className="error-state">{error}</p>}
          <div className="mmc-interest-modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Please wait...' : (submitLabel || 'Show My Comparison')}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
