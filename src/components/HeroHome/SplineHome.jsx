import React from 'react';

export const CONTACT_SPLINE_SCENE =
  'https://my.spline.design/radialpattern-dOqadC6PoXhFs51enuOZYYd2/';

export default function SplineHome() {
  return (
    <div className="mmc-spline-stage">
      <iframe
        src={CONTACT_SPLINE_SCENE}
        title="3D Contact Scene"
        frameBorder="0"
        allow="fullscreen"
      />
    </div>
  );
}