import React from 'react';

export default function BlogFilter({ categories, value, onChange }) {
  const options = ['All', ...categories];

  return (
    <div className="mmc-blog-filter">
      <label className="mmc-blog-filter-select">
        <span className="sr-only">Filter by category</span>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((category) => (
            <option key={category} value={category}>
              {category === 'All' ? 'All Posts' : category}
            </option>
          ))}
        </select>
      </label>

      <div className="mmc-blog-filter-pills" role="tablist" aria-label="Filter by category">
        {options.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={value === category}
            className={`mmc-blog-pill${value === category ? ' is-active' : ''}`}
            onClick={() => onChange(category)}
          >
            {category === 'All' ? 'All Posts' : category}
          </button>
        ))}
      </div>
    </div>
  );
}
