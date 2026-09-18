import React from 'react';
import { useLocation } from 'react-router-dom';

export default function PageEnter({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="mmc-page-enter">
      {children}
    </div>
  );
}
