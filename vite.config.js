import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Same targets used by vercel.json so `npm run preview` matches production routing.
const API_PROXY_TARGET = 'https://education-fr-new.onrender.com';

function stripBrowserOrigin() {
  return {
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq) => {
        // Render CORS rejects unknown Origins with HTTP 500. The browser talks
        // same-origin to this preview server; do not forward Origin upstream.
        proxyReq.removeHeader('origin');
      });
    },
  };
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
        ...stripBrowserOrigin(),
      },
      '/uploads': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
        ...stripBrowserOrigin(),
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
