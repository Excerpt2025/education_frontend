import React from 'react';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';

export default function BlogSearch({ value, onChange }) {
  return (
    <label className="mmc-blog-search">
      <span className="sr-only">Search posts</span>
      <span className="mmc-blog-search-icon">
        <OutlineIcon name="search" size={18} />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search posts"
        autoComplete="off"
      />
      {value ? (
        <button type="button" className="mmc-blog-search-clear" onClick={() => onChange('')} aria-label="Clear search">
          <OutlineIcon name="close" size={16} />
        </button>
      ) : null}
    </label>
  );
}
