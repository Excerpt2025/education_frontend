import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { exportNodeToPdf } from '../../utils/pdfExport.js';
import './CareerReportCard.css';

// Put your logo in /public/images/logo.png (or change this path).
// If the file is missing the header falls back to the text brand automatically.
const LOGO_SRC = '/images/logo.png';
const BRAND = 'MapMyCareer360';

const SECTION_LABELS = {
  interest: 'Interests',
  aptitude: 'Aptitude',
  personality: 'Personality',
  adaptive: 'Career Orientation',
};

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
}
function formatTime(d) {
  return d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
}
function fmtDuration(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} min ${r} sec` : `${m} min`;
}

export default function CareerReportCard({ report, studentName, student, compact }) {
  const nodeRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [logoOk, setLogoOk] = useState(true);
  const [showAllCareers, setShowAllCareers] = useState(false);
  const [openCareer, setOpenCareer] = useState(null);
  const [activeField, setActiveField] = useState(null);

  const r = report?.result || {};
  const scores = report?.scores || {};
  const info = report?.studentInfo || {};
  const time = r.timeTaken || null;

  const rankedScores = useMemo(() => Object.entries(scores).sort((a, b) => b[1] - a[1]), [scores]);
  const maxScore = rankedScores[0]?.[1] || 1;
  const totalScore = rankedScores.reduce((sum, [, v]) => sum + Number(v || 0), 0) || 1;

  if (!report) return null;

  // Student details: prefer what was saved with the report, fall back to the logged-in student
  const details = {
    name: info.fullName || studentName || student?.fullName || 'Student',
    email: info.email || student?.email || '',
    phone: info.phone || student?.phone || '',
    gender: info.gender || student?.gender || '',
  };
  const reportId = report._id ? `MMC-${String(report._id).slice(-6).toUpperCase()}` : '';

  const allCareers = r.top10Careers?.length ? r.top10Careers : (r.top3Careers || []);
  const visibleCareers = exporting || showAllCareers ? allCareers : allCareers.slice(0, 3);

  const downloadPdf = async () => {
    if (!nodeRef.current) return;
    setExporting(true);
    try {
      // Let React apply the "is-exporting" layout (fixed width, no animations,
      // everything expanded) before the page is captured.
      await new Promise((res) => setTimeout(res, 250));
      await exportNodeToPdf(
        nodeRef.current,
        `career-report-${details.name.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      );
    } finally {
      setExporting(false);
    }
  };

  const pace = time && time.estimatedSeconds
    ? (time.totalSeconds <= time.estimatedSeconds * 0.6 ? 'Quick decision-maker'
      : time.totalSeconds <= time.estimatedSeconds * 1.4 ? 'Balanced pace' : 'Thoughtful & deliberate')
    : '';

  return (
    <div className={`mmc-report-wrap${compact ? ' is-compact' : ''}${exporting ? ' is-exporting' : ''}`}>
      {!compact && (
        <div className="mmc-report-actions">
          <button type="button" className="btn btn-primary" onClick={downloadPdf} disabled={exporting}>
            {exporting ? 'Preparing PDF...' : '⬇ Download PDF Report'}
          </button>
          <Link to="/dashboard" className="btn btn-outline">Go to Dashboard →</Link>
        </div>
      )}

      <div className="mmc-report-card" ref={nodeRef}>
        <div className="mmc-report-blob mmc-report-blob-a" aria-hidden="true" />
        <div className="mmc-report-blob mmc-report-blob-b" aria-hidden="true" />

        {/* ---------- Top bar: logo + report meta ---------- */}
        <header className="mmc-report-topbar">
          <div className="mmc-report-brand">
            {logoOk ? (
              <img src={LOGO_SRC} alt={BRAND} className="mmc-report-logo" crossOrigin="anonymous" onError={() => setLogoOk(false)} />
            ) : (
              <span className="mmc-report-logo-text">{BRAND}</span>
            )}
          </div>
          <div className="mmc-report-meta">
            <span className="mmc-report-badge">Career Assessment Report</span>
            <small>
              {reportId && <>ID {reportId} · </>}
              {formatDate(report.createdAt)}{report.createdAt ? ` · ${formatTime(report.createdAt)}` : ''}
            </small>
          </div>
        </header>

        {/* ---------- Title + archetype ---------- */}
        <div className="mmc-report-head">
          <p className="mmc-report-eyebrow">Your career archetype</p>
          <h2>{r.archetype || 'Your Career Profile'}</h2>
        </div>

        {/* ---------- Student details ---------- */}
        <section className="mmc-report-student">
          <div className="mmc-report-avatar" aria-hidden="true">{details.name.charAt(0).toUpperCase()}</div>
          <div className="mmc-report-student-grid">
            <div><span>Student</span><strong>{details.name}</strong></div>
            {details.email && <div><span>Email</span><strong>{details.email}</strong></div>}
            {details.phone && <div><span>Phone</span><strong>{details.phone}</strong></div>}
            {details.gender && <div><span>Gender</span><strong>{details.gender}</strong></div>}
            <div><span>Assessed on</span><strong>{formatDate(report.createdAt) || '-'}</strong></div>
          </div>
        </section>

        {/* ---------- Stat tiles ---------- */}
        <section className="mmc-report-stats">
          <div className="mmc-report-stat is-primary">
            <span>Best-fit field</span>
            <strong>{r.topField || '-'}</strong>
          </div>
          {r.secondField && (
            <div className="mmc-report-stat">
              <span>Second match</span>
              <strong>{r.secondField}</strong>
            </div>
          )}
          {time && (
            <>
              <div className="mmc-report-stat">
                <span>⏱ Time taken</span>
                <strong>{fmtDuration(time.totalSeconds)}</strong>
              </div>
              <div className="mmc-report-stat">
                <span>Avg. per question</span>
                <strong>{fmtDuration(time.averageSeconds)}</strong>
              </div>
            </>
          )}
        </section>

        {r.stream && <p className="mmc-report-stream"><strong>Recommended stream:</strong> {r.stream}</p>}

        {/* ---------- Timing breakdown ---------- */}
        {time && (
          <section className="mmc-report-section">
            <h4>Time Breakdown</h4>
            <div className="mmc-report-time-grid">
              {Object.entries(time.sections || {}).filter(([, v]) => v > 0).map(([key, sec]) => (
                <div className="mmc-report-time-chip" key={key}>
                  <span>{SECTION_LABELS[key] || key}</span>
                  <strong>{fmtDuration(sec)}</strong>
                </div>
              ))}
            </div>
            <p className="mmc-report-note">
              {time.questionCount} questions answered
              {time.estimatedSeconds ? ` · expected about ${fmtDuration(time.estimatedSeconds)}` : ''}
              {pace ? ` · ${pace}` : ''}
            </p>
          </section>
        )}

        {/* ---------- Field scores (click a bar to focus it) ---------- */}
        {rankedScores.length > 0 && (
          <section className="mmc-report-section">
            <h4>Your Field Scores <small>tap a bar to highlight</small></h4>
            <div className="mmc-report-bars">
              {rankedScores.map(([field, score], i) => {
                const pct = Math.round((score / totalScore) * 100);
                const dim = activeField && activeField !== field;
                return (
                  <button
                    type="button"
                    className={`mmc-report-bar-row${activeField === field ? ' is-active' : ''}${dim ? ' is-dim' : ''}`}
                    key={field}
                    onClick={() => setActiveField(activeField === field ? null : field)}
                  >
                    <span className="mmc-report-bar-label">{field}</span>
                    <span className="mmc-report-bar-track">
                      <span
                        className={`mmc-report-bar-fill accent-${i % 4}`}
                        style={{ width: `${Math.max(6, (score / maxScore) * 100)}%` }}
                      />
                    </span>
                    <span className="mmc-report-bar-score">{score}<small> · {pct}%</small></span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------- Careers (expandable) ---------- */}
        {allCareers.length > 0 && (
          <section className="mmc-report-section">
            <h4>Careers That Match You</h4>
            <div className="mmc-report-careers">
              {visibleCareers.map((c, i) => {
                const open = exporting || openCareer === c.name;
                return (
                  <button
                    type="button"
                    key={c.name}
                    className={`mmc-report-career-card${open ? ' is-open' : ''}`}
                    onClick={() => setOpenCareer(open ? null : c.name)}
                  >
                    <span className="mmc-report-career-rank">{i + 1}</span>
                    <span className="mmc-report-career-body">
                      <strong>{c.name}</strong>
                      <span className="mmc-report-career-blurb">{c.blurb}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {allCareers.length > 3 && !exporting && (
              <button type="button" className="mmc-report-more" onClick={() => setShowAllCareers((v) => !v)}>
                {showAllCareers ? 'Show fewer' : `Show all ${allCareers.length} careers`}
              </button>
            )}
          </section>
        )}

        {r.courses?.length > 0 && (
          <section className="mmc-report-section">
            <h4>Suggested Courses</h4>
            <div className="mmc-report-chips">
              {r.courses.map((c) => <span key={c}>{c}</span>)}
            </div>
          </section>
        )}

        {/* ---------- Roadmap timeline ---------- */}
        {r.roadmap?.length > 0 && (
          <section className="mmc-report-section">
            <h4>Your Career Roadmap</h4>
            <ol className="mmc-report-roadmap">
              {r.roadmap.map((step, i) => (
                <li className="mmc-report-roadmap-step" key={step.stage + i}>
                  <span className="mmc-report-roadmap-dot">{i + 1}</span>
                  <div>
                    <strong>{step.stage}</strong>
                    <p>{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {(r.strengths?.length > 0 || r.growthAreas?.length > 0) && (
          <section className="mmc-report-section mmc-report-two-col">
            {r.strengths?.length > 0 && (
              <div>
                <h4>Strengths</h4>
                <ul className="mmc-report-list is-good">{r.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )}
            {r.growthAreas?.length > 0 && (
              <div>
                <h4>Growth Areas</h4>
                <ul className="mmc-report-list is-growth">{r.growthAreas.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )}
          </section>
        )}

        {(r.workStyle || r.growth) && (
          <section className="mmc-report-section mmc-report-footnote">
            {r.workStyle && <p><strong>Work style fit:</strong> {r.workStyle}</p>}
            {r.growth && <p><strong>Career growth outlook:</strong> {r.growth}</p>}
          </section>
        )}

        <footer className="mmc-report-footer">
          <span>{BRAND} · Career Assessment</span>
          <span>This report is a guidance tool, not a final decision. Talk to a counsellor for next steps.</span>
        </footer>
      </div>
    </div>
  );
}