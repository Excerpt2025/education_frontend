/**
 * Vercel Edge Middleware: same-origin proxy for API + uploads.
 * Strips Origin/Referer so the Render backend CORS allowlist does not block
 * *.vercel.app (previously returned HTTP 500 for unknown origins).
 *
 * Also strips Content-Encoding / Content-Length on the way back: Edge fetch
 * decompresses gzip/br automatically, and forwarding those headers causes
 * browsers to fail with ERR_CONTENT_DECODING_FAILED.
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
    if (k === 'host' || k === 'origin' || k === 'referer' || k === 'accept-encoding') continue;
    headers.set(key, value);
  }
  // Ask upstream for uncompressed body so we never mismatch encoding headers
  headers.set('accept-encoding', 'identity');

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
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');
  responseHeaders.delete('transfer-encoding');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
