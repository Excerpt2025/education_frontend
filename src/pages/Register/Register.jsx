import React from 'react';
import { AuthCard } from '../Login/Login.jsx';

// Register shares the same flip card as Login, opened on the sign-up face.
// Keeps the /register route and the ?ref= / ?email= query params working.
export default function Register() {
  return <AuthCard initial="register" />;
}