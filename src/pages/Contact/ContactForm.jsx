import React, { useState } from 'react';
import api from '../../api/api.js';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import ErrorBoundary from '../../components/ErrorBoundary.jsx';

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_OK = /^\+?[\d\s()-]{8,18}$/;

const EMPTY = { name: '', email: '', phone: '', message: '' };

function validate(form) {
  const errors = {};
  if (!form.name.trim() || form.name.trim().length < 2) {
    errors.name = 'Please enter your full name.';
  }
  if (!form.email.trim() || !EMAIL_OK.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!form.phone.trim() || !PHONE_OK.test(form.phone.trim())) {
    errors.phone = 'Please enter a valid phone number.';
  }
  if (!form.message.trim() || form.message.trim().length < 5) {
    errors.message = 'Please tell us how we can help.';
  }
  return errors;
}

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, sent: false, error: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ loading: false, sent: false, error: '' });
      return;
    }

    setStatus({ loading: true, sent: false, error: '' });
    try {
      await api.post('/contact', form);
      setStatus({ loading: false, sent: true, error: '' });
      setForm(EMPTY);
    } catch {
      setStatus({
        loading: false,
        sent: false,
        error: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <form className="mmc-contact-form" onSubmit={handleSubmit} noValidate>
      <div className={`mmc-form-group${errors.name ? ' has-error' : ''}`}>
        <label htmlFor="contact-name">Full Name</label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
        />
        {errors.name ? <p id="contact-name-error" className="mmc-field-error">{errors.name}</p> : null}
      </div>

      <div className={`mmc-form-group${errors.email ? ' has-error' : ''}`}>
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
        />
        {errors.email ? <p id="contact-email-error" className="mmc-field-error">{errors.email}</p> : null}
      </div>

      <div className={`mmc-form-group${errors.phone ? ' has-error' : ''}`}>
        <label htmlFor="contact-phone">Phone</label>
        <input
          id="contact-phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
        />
        {errors.phone ? <p id="contact-phone-error" className="mmc-field-error">{errors.phone}</p> : null}
      </div>

      <div className={`mmc-form-group${errors.message ? ' has-error' : ''}`}>
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows="4"
          placeholder="How can we help you?"
          value={form.message}
          onChange={handleChange}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        {errors.message ? <p id="contact-message-error" className="mmc-field-error">{errors.message}</p> : null}
      </div>

      {status.error ? (
        <p className="mmc-error-msg" role="alert">{status.error}</p>
      ) : null}
      {status.sent ? (
        <p className="mmc-success-msg" role="status">Thanks! We'll get back to you shortly.</p>
      ) : null}

      <button className="mmc-contact-submit" type="submit" disabled={status.loading}>
        {status.loading ? 'Sending…' : 'Send Message'}
        {!status.loading ? (
          <ErrorBoundary fallback={null}>
            <OutlineIcon name="arrow" size={16} />
          </ErrorBoundary>
        ) : null}
      </button>
    </form>
  );
}