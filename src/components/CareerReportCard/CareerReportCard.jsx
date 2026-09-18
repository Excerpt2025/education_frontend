import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { exportNodeToPdf } from '../../utils/pdfExport.js';
import './CareerReportCard.css';

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
}

export default function CareerReportCard({ report, studentName, compact }) {
  const nodeRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  if (!report) return null;

  const r = report.result || {};
  const scores = report.scores || {};
  const rankedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const maxScore = rankedScores[0]?.[1] || 1;

  const downloadPdf = async () => {
    if (!nodeRef.current) return;
    setExporting(true);
    try {
      await exportNodeToPdf(nodeRef.current, `career-report-${(studentName || 'student').replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`mmc-report-wrap${compact ? ' is-compact' : ''}`}>
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

        <div className="mmc-report-head">
          <span className="mmc-report-badge">Career Assessment Report</span>
          <h2>{r.archetype || 'Your Career Profile'}</h2>
          {studentName && <p className="mmc-report-name">Prepared for {studentName}{report.createdAt ? ` · ${formatDate(report.createdAt)}` : ''}</p>}
        </div>

        {r.topField && (
          <div className="mmc-report-top-field">
            <span className="mmc-report-top-label">Best-fit field</span>
            <h3>{r.topField}</h3>
            {r.stream && <p>{r.stream}</p>}
          </div>
        )}

        {rankedScores.length > 0 && (
          <div className="mmc-report-section">
            <h4>Your Field Scores</h4>
            <div className="mmc-report-bars">
              {rankedScores.map(([field, score], i) => (
                <div className="mmc-report-bar-row" key={field}>
                  <span className="mmc-report-bar-label">{field}</span>
                  <div className="mmc-report-bar-track">
                    <div
                      className={`mmc-report-bar-fill accent-${i % 4}`}
                      style={{ width: `${Math.max(6, (score / maxScore) * 100)}%` }}
                    />
                  </div>
                  <span className="mmc-report-bar-score">{score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {r.top3Careers?.length > 0 && (
          <div className="mmc-report-section">
            <h4>Careers That Match You</h4>
            <div className="mmc-report-careers">
              {r.top3Careers.map((c) => (
                <div className="mmc-report-career-card" key={c.name}>
                  <strong>{c.name}</strong>
                  <p>{c.blurb}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {r.courses?.length > 0 && (
          <div className="mmc-report-section">
            <h4>Suggested Courses</h4>
            <div className="mmc-report-chips">
              {r.courses.map((c) => <span key={c}>{c}</span>)}
            </div>
          </div>
        )}

        {r.roadmap?.length > 0 && (
          <div className="mmc-report-section">
            <h4>Your Career Roadmap</h4>
            <div className="mmc-report-roadmap">
              {r.roadmap.map((step, i) => (
                <div className="mmc-report-roadmap-step" key={step.stage + i}>
                  <span className="mmc-report-roadmap-dot">{i + 1}</span>
                  <div>
                    <strong>{step.stage}</strong>
                    <p>{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(r.strengths?.length > 0 || r.growthAreas?.length > 0) && (
          <div className="mmc-report-section mmc-report-two-col">
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
          </div>
        )}

        {(r.workStyle || r.growth) && (
          <div className="mmc-report-section mmc-report-footnote">
            {r.workStyle && <p><strong>Work style fit:</strong> {r.workStyle}</p>}
            {r.growth && <p><strong>Career growth outlook:</strong> {r.growth}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
