import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { student, loading } = useAuth();
  if (loading) return <div className="loading-state">Loading...</div>;
  if (!student) return <Navigate to="/login" replace />;
  return children;
}
