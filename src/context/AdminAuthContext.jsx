import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api.js';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mmc_admin_token');
    if (!token) { setLoading(false); return; }
    api.get('/admin/me')
      .then((res) => setAdmin(res.data.admin))
      .catch(() => { localStorage.removeItem('mmc_admin_token'); })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, adminData) => {
    localStorage.setItem('mmc_admin_token', token);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('mmc_admin_token');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, setAdmin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
