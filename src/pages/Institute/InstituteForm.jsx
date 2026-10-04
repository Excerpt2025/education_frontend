import React, { useState } from 'react';
import api from '../../api/api.js';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import { INTEREST_OPTIONS, STUDY_MODES, TYPE_OPTIONS } from './instituteContent.js';

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_OK = /^\+?[\d\s()-]{8,18}$/;
const WEBSITE_OK = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}([/?#]\S*)?$/i;

const EMPTY = {
  institutionName: '',
  institutionType: '',
  cityState: '',
  website: '',
  contactName: '',
  designation: '',
  email: '',
  phone: '',
  courses: '',
  studyMode: '',
  interest: '',
  message: '',
  declaration: false,
};

function validate(form) {
  const errors = {};
  if (!form.institutionName.trim() || form.institutionName.trim().length < 2) {
    errors.institutionName = 'Please enter the institution or organisation name.';
  }
  if (!form.institutionType) {
    errors.institutionType = 'Please select an institution type.';
  }
  if (!form.cityState.trim() || form.cityState.trim().length < 2) {
    errors.cityState = 'Please enter the city and state.';
  }
  if (form.website.trim() && !WEBSITE_OK.test(form.website.trim())) {
    errors.website = 'Please enter a valid website, or leave this blank.';
  }
  if (!form.contactName.trim() || form.contactName.trim().length < 2) {
    errors.contactName = "Please enter the contact person's name.";
  }
  if (!form.designation.trim() || form.designation.trim().length < 2) {
    errors.designation = 'Please enter the designation.';
  }
  if (!form.email.trim() || !EMAIL_OK.test(form.email.trim())) {
    errors.email = 'Please enter a valid official email address.';
  }
  if (!form.phone.trim() || !PHONE_OK.test(form.phone.trim())) {
    errors.phone = 'Please enter a valid contact or WhatsApp number.';
  }
  if (!form.courses.trim() || form.courses.trim().length < 2) {
    errors.courses = 'Please list the courses or programmes offered.';
  }
  if (!form.studyMode) {
    errors.studyMode = 'Please select a study mode.';
  }
  if (!form.interest) {
    errors.interest = 'Please select an area of interest.';
  }
  if (!form.declaration) {
    errors.declaration = 'Please confirm the declaration before submitting.';
  }
  return errors;
}

function buildMessage(form) {
  return [
    '[Institution Registration]',
    `Institution: ${form.institutionName.trim()}`,
    `Type: ${form.institutionType}`,
    `City and state: ${form.cityState.trim()}`,
    `Website: ${form.website.trim() || 'Not provided'}`,
    `Contact person: ${form.contactName.trim()}`,
    `Designation: ${form.designation.trim()}`,
    `Email: ${form.email.trim()}`,
    `Phone: ${form.phone.trim()}`,
    `Courses or programmes: ${form.courses.trim()}`,
    `Study mode: ${form.studyMode}`,
    `Area of interest: ${form.interest}`,
    `Additional message: ${form.message.trim() || 'None'}`,
    'Declaration: Confirmed that the information is accurate and MapMyCareer360 may make contact.',
  ].join('\n');
}

function Field({ id, label, required, error, children }) {
  return (
    <div className={`form-group mmc-inst-field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required ? <span className="mmc-inst-req" aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {error ? <p id={`${id}-error`} className="mmc-inst-field-error">{error}</p> : null}
    </div>
  );
}

export default function InstituteForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, sent: false, error: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const next = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: next }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ loading: false, sent: false, error: '' });
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }

    setStatus({ loading: true, sent: false, error: '' });
    try {
      await api.post('/contact', {
        name: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: buildMessage(form),
      });
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

  const described = (name) => (errors[name] ? `${name}-error` : undefined);

  return (
    <form className="card mmc-inst-form" onSubmit={handleSubmit} noValidate>
      <div className="mmc-inst-form-grid">
        <Field id="institutionName" label="Institution or Organisation Name" required error={errors.institutionName}>
          <input
            id="institutionName"
            name="institutionName"
            autoComplete="organization"
            value={form.institutionName}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.institutionName)}
            aria-describedby={described('institutionName')}
          />
        </Field>

        <Field id="institutionType" label="Institution Type" required error={errors.institutionType}>
          <select
            id="institutionType"
            name="institutionType"
            value={form.institutionType}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.institutionType)}
            aria-describedby={described('institutionType')}
          >
            <option value="">Select institution type</option>
            {TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </Field>

        <Field id="cityState" label="City and State" required error={errors.cityState}>
          <input
            id="cityState"
            name="cityState"
            autoComplete="address-level2"
            value={form.cityState}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.cityState)}
            aria-describedby={described('cityState')}
          />
        </Field>

        <Field id="website" label="Official Website" error={errors.website}>
          <input
            id="website"
            name="website"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://www.example.edu"
            value={form.website}
            onChange={handleChange}
            aria-invalid={Boolean(errors.website)}
            aria-describedby={described('website')}
          />
        </Field>

        <Field id="contactName" label="Contact Person’s Name" required error={errors.contactName}>
          <input
            id="contactName"
            name="contactName"
            autoComplete="name"
            value={form.contactName}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.contactName)}
            aria-describedby={described('contactName')}
          />
        </Field>

        <Field id="designation" label="Designation" required error={errors.designation}>
          <input
            id="designation"
            name="designation"
            autoComplete="organization-title"
            value={form.designation}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.designation)}
            aria-describedby={described('designation')}
          />
        </Field>

        <Field id="email" label="Official Email Address" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={described('email')}
          />
        </Field>

        <Field id="phone" label="Contact or WhatsApp Number" required error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={described('phone')}
          />
        </Field>

        <Field id="courses" label="Courses or Programmes Offered" required error={errors.courses}>
          <textarea
            id="courses"
            name="courses"
            rows="4"
            placeholder="List the courses or programmes, one per line"
            value={form.courses}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.courses)}
            aria-describedby={described('courses')}
          />
        </Field>

        <Field id="studyMode" label="Study Mode" required error={errors.studyMode}>
          <select
            id="studyMode"
            name="studyMode"
            value={form.studyMode}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.studyMode)}
            aria-describedby={described('studyMode')}
          >
            <option value="">Select study mode</option>
            {STUDY_MODES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </Field>

        <Field id="interest" label="Area of Interest" required error={errors.interest}>
          <select
            id="interest"
            name="interest"
            value={form.interest}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.interest)}
            aria-describedby={described('interest')}
          >
            <option value="">Select an area of interest</option>
            {INTEREST_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </Field>

        <Field id="message" label="Additional Message" error={errors.message}>
          <textarea
            id="message"
            name="message"
            rows="4"
            value={form.message}
            onChange={handleChange}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={described('message')}
          />
        </Field>
      </div>

      <div className={`mmc-inst-declare${errors.declaration ? ' has-error' : ''}`}>
        <label htmlFor="declaration">
          <input
            id="declaration"
            name="declaration"
            type="checkbox"
            checked={form.declaration}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.declaration)}
            aria-describedby={errors.declaration ? 'declaration-error' : undefined}
          />
          <span>
            I confirm that the information provided is accurate and authorise MapMyCareer360 to contact me about institution listing and potential collaboration.
            <span className="mmc-inst-req" aria-hidden="true"> *</span>
          </span>
        </label>
        {errors.declaration ? (
          <p id="declaration-error" className="mmc-inst-field-error">{errors.declaration}</p>
        ) : null}
      </div>

      {status.error ? <p className="mmc-inst-status is-error" role="alert">{status.error}</p> : null}
      {status.sent ? (
        <p className="mmc-inst-status is-success" role="status">
          Thank you. Our team will review your submission and contact you to discuss the next steps.
        </p>
      ) : null}

      <button className="btn btn-primary mmc-inst-submit" type="submit" disabled={status.loading}>
        {status.loading ? 'Submitting...' : 'Submit Institution Details'}
        {!status.loading ? <OutlineIcon name="arrow" size={16} /> : null}
      </button>
    </form>
  );
}
