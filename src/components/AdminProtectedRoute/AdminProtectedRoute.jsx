import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

export default function AdminProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return <div className="loading-state">Loading...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}
