import axios from 'axios';

/**
 * Base URL resolution order:
 * 1. VITE_API_BASE_URL from .env.development / .env.production (recommended)
 * 2. Fallback: localhost while developing, current domain '/api' in production
 *
 * Production (Vercel) uses VITE_API_BASE_URL=/api with vercel.json rewrites
 * proxying /api and /uploads to the Render backend (avoids CORS on *.vercel.app).
 */
function resolveBaseURL() {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.PROD) return `${window.location.origin}/api`;
  return 'http://localhost:5000/api';
}

export const BASE_URL = resolveBaseURL();

// #region agent log
fetch('http://127.0.0.1:7477/ingest/23e2ad8a-3088-4bff-a10e-8a95fcd860eb',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'475351'},body:JSON.stringify({sessionId:'475351',runId:'post-fix',hypothesisId:'A',location:'src/api/api.js:resolveBaseURL',message:'Resolved API BASE_URL at module load',data:{baseURL:BASE_URL,hasViteApiBaseUrl:Boolean(import.meta.env.VITE_API_BASE_URL),viteApiBaseUrl:import.meta.env.VITE_API_BASE_URL||null,isProd:import.meta.env.PROD,mode:import.meta.env.MODE,origin:typeof window!=='undefined'?window.location.origin:null},timestamp:Date.now()})}).catch(()=>{});
// #endregion

// The backend's root origin, i.e. BASE_URL with the trailing "/api" removed.
// Needed because uploaded files (multer) are saved and returned as paths like
// "/uploads/169...-123.webp" - relative to the SERVER's root, not "/api" and
// not the frontend's own origin. Example:
//   BASE_URL      = http://localhost:5000/api
//   SERVER_ORIGIN  = http://localhost:5000
// When BASE_URL is relative "/api", SERVER_ORIGIN is "" so /uploads stays same-origin
// (also proxied by vercel.json / vite preview).
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
  (res) => {
    // #region agent log
    if (res.config?.url === '/sliders' || res.config?.url === '/colleges' || res.config?.url?.includes('health')) {
      fetch('http://127.0.0.1:7477/ingest/23e2ad8a-3088-4bff-a10e-8a95fcd860eb',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'475351'},body:JSON.stringify({sessionId:'475351',runId:'post-fix',hypothesisId:'A',location:'src/api/api.js:responseSuccess',message:'API request succeeded',data:{url:res.config?.url||null,baseURL:res.config?.baseURL||BASE_URL,status:res.status},timestamp:Date.now()})}).catch(()=>{});
    }
    // #endregion
    return res;
  },
  (err) => {
    // #region agent log
    fetch('http://127.0.0.1:7477/ingest/23e2ad8a-3088-4bff-a10e-8a95fcd860eb',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'475351'},body:JSON.stringify({sessionId:'475351',runId:'post-fix',hypothesisId:'B',location:'src/api/api.js:responseInterceptor',message:'API request failed',data:{url:err.config?.url||null,baseURL:err.config?.baseURL||BASE_URL,status:err.response?.status??null,code:err.code||null,message:err.message||null,responseMessage:err.response?.data?.message||null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (err.response && err.response.status === 401) {
      // token expired / invalid - let calling component decide what to do
    }
    return Promise.reject(err);
  }
);

export default api;
