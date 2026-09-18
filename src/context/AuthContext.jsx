import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mmc_student_token');
    if (!token) { setLoading(false); return; }
    api.get('/students/me')
      .then((res) => setStudent(res.data.student))
      .catch(() => { localStorage.removeItem('mmc_student_token'); })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, studentData) => {
    localStorage.setItem('mmc_student_token', token);
    setStudent(studentData);
  };

  const logout = () => {
    localStorage.removeItem('mmc_student_token');
    setStudent(null);
  };

  return (
    <AuthContext.Provider value={{ student, setStudent, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
