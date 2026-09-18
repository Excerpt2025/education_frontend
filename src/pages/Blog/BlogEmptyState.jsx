import React from 'react';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';

export default function BlogEmptyState({ onClear }) {
  return (
    <div className="mmc-blog-empty">
      <span className="mmc-blog-empty-icon">
        <OutlineIcon name="book" size={28} />
      </span>
      <h2>No posts found</h2>
      <p>Try a different keyword or choose another category.</p>
      <button type="button" className="btn btn-ink" onClick={onClear}>
        Clear search and filters
      </button>
    </div>
  );
}
