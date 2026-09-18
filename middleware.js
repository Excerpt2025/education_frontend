/**
 * Vercel Edge Middleware: same-origin proxy for API + uploads.
 * Strips Origin/Referer so the Render backend CORS allowlist does not block
 * *.vercel.app (previously returned HTTP 500 for unknown origins).
 */
export const config = {
  matcher: ['/api/:path*', '/uploads/:path*'],
};

const UPSTREAM = 'https://education-fr-new.onrender.com';

export default async function middleware(request) {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, UPSTREAM);

  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const k = key.toLowerCase();
    if (k === 'host' || k === 'origin' || k === 'referer') continue;
    headers.set(key, value);
  }

  /** @type {RequestInit} */
  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
    // Required when forwarding a streamed request body on the Edge runtime
    init.duplex = 'half';
  }

  const upstream = await fetch(target, init);
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });
}
