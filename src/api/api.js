import axios from 'axios';

/**
 * Base URL resolution order:
 * 1. VITE_API_BASE_URL from .env.development / .env.production (recommended)
 * 2. Fallback: localhost while developing, current domain '/api' in production
 *
 * Production (Vercel) uses VITE_API_BASE_URL=/api with middleware.js proxying
 * /api and /uploads to the Render backend (avoids CORS on *.vercel.app).
 */
function resolveBaseURL() {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.PROD) return `${window.location.origin}/api`;
  return 'http://localhost:5000/api';
}

export const BASE_URL = resolveBaseURL();

// The backend's root origin, i.e. BASE_URL with the trailing "/api" removed.
// Needed because uploaded files (multer) are saved and returned as paths like
// "/uploads/169...-123.webp" - relative to the SERVER's root, not "/api" and
// not the frontend's own origin. Example:
//   BASE_URL      = http://localhost:5000/api
//   SERVER_ORIGIN  = http://localhost:5000
// When BASE_URL is relative "/api", SERVER_ORIGIN is "" so /uploads stays same-origin
// (also proxied by middleware.js / vite preview).
export const SERVER_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

/**
 * Resolves an image path coming from the backend (colleges, sliders, profile
 * photos, etc.) into a URL the browser can actually load.
 *  - Already-absolute URLs (http://, https://) are returned unchanged.
 *  - Frontend-hosted static assets (e.g. "/images/hero-1-desktop.webp" served
 *    from the React app's own public/ folder) are returned unchanged.
 *  - Backend-uploaded files (e.g. "/uploads/169...-123.webp") get prefixed
 *    with SERVER_ORIGIN so they resolve against the API server, not the
 *    frontend's own origin.
 */
export function getImageUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/images/')) return path; // frontend public/ assets, leave as-is
  return `${SERVER_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach student/admin token automatically
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('mmc_admin_token');
  const studentToken = localStorage.getItem('mmc_student_token');
  const token = config.url?.startsWith('/admin') ? adminToken : (studentToken || adminToken);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // token expired / invalid - let calling component decide what to do
    }
    return Promise.reject(err);
  }
);

export default api;
