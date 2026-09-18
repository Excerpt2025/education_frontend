import React from 'react';

export default function BlogSkeleton({ count = 6 }) {
  return (
    <div className="mmc-blog-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="mmc-blog-card mmc-blog-skel">
          <div className="mmc-blog-card-media mmc-blog-skel-block" />
          <div className="mmc-blog-card-body">
            <span className="mmc-blog-skel-line mmc-blog-skel-line--sm" />
            <span className="mmc-blog-skel-line" />
            <span className="mmc-blog-skel-line mmc-blog-skel-line--mid" />
            <span className="mmc-blog-skel-line mmc-blog-skel-line--sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
