import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // When behind a reverse proxy with HTTPS termination (e.g., Nginx),
  // next-intl constructs rewrite URLs using the https:// protocol from
  // the X-Forwarded-Proto header. Since the Next.js server runs on HTTP
  // internally, rewrite URLs must use http:// to avoid SSL errors.
  const rewrite = response.headers.get('x-middleware-rewrite');
  if (rewrite) {
    try {
      const url = new URL(rewrite);
      if (
        url.protocol === 'https:' &&
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
      ) {
        url.protocol = 'http:';
        response.headers.set('x-middleware-rewrite', url.toString());
      }
    } catch {
      // ignore invalid URLs
    }
  }

  // Remove location header ONLY if there's a rewrite
  // This prevents redirect loops when we're doing internal rewrites
  // But allows normal redirects (like / -> /tr) to work
  if (rewrite && response.headers.has('location')) {
    response.headers.delete('location');
  }

  return response;
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
