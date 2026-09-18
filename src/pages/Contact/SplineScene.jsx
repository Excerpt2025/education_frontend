import React from 'react';

export const CONTACT_SPLINE_SCENE =
  'https://my.spline.design/r4xbot-pBUh3jXoltFqa2wY4bvK3kFC/';

export default function SplineScene() {
  return (
    <div className="mmc-spline-stage" aria-hidden="true">
      <image src="/images/contactus.jpg" alt="Spline Scene" className="mmc-spline-image" />
      {/* Covers Spline free-tier badge (cross-origin iframe can't remove it) */}
      <span className="mmc-spline-badge-cover" />
    </div>
  );
}
