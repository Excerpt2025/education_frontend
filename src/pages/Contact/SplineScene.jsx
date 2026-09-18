import React from 'react';

export const CONTACT_SPLINE_SCENE =
  'https://my.spline.design/r4xbot-pBUh3jXoltFqa2wY4bvK3kFC/';

export default function SplineScene() {
  return (
    <div className="mmc-spline-stage" aria-hidden="true">
      <iframe
        src={CONTACT_SPLINE_SCENE}
        title="3D Contact Scene"
        loading="lazy"
        frameBorder="0"
        allow="fullscreen"
      />
      {/* Covers Spline free-tier badge (cross-origin iframe can't remove it) */}
      <span className="mmc-spline-badge-cover" />
    </div>
  );
}
