import React from 'react';
import './PredictorResultTable.css';

function Zone({ label, rows, badgeClass }) {
  if (!rows || !rows.length) return null;
  return (
    <div className="mmc-zone-block">
      <h4><span className={`badge ${badgeClass}`}>{label}</span> Colleges ({rows.length})</h4>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>College</th>
              <th>Course</th>
              <th>Category</th>
              <th>Cutoff Rank</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                <td>{r.college?.name || '-'}</td>
                <td>{r.course?.name || '-'}</td>
                <td>{r.category}</td>
                <td>{r.cutoffRank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PredictorResultTable({ result }) {
  if (!result) return null;
  const noResults = !result.safe?.length && !result.moderate?.length && !result.dream?.length;
  if (noResults) {
    return <div className="empty-state">No matching colleges found yet. Try a different rank/category, or check back after the admin uploads more cutoff data.</div>;
  }
  return (
    <div className="mmc-predictor-results">
      <Zone label="Safe" rows={result.safe} badgeClass="badge-safe" />
      <Zone label="Moderate" rows={result.moderate} badgeClass="badge-moderate" />
      <Zone label="Dream" rows={result.dream} badgeClass="badge-dream" />
    </div>
  );
}
