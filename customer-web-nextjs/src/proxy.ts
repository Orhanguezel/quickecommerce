import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * "en" locale 2026-07-27'de kaldirildi (bkz. i18n/routing.ts).
 *
 * Locale listesinden cikarmak TEK BASINA YETMEZ: next-intl artik "/en/..."
 * yolunu locale olarak tanimaz ve 404 uretir. Google'da indekslenmis /en/
 * URL'leri oldugu icin bunlar 404 yerine Turkce karsiligina KALICI olarak
 * yonlendirilir (308: kalici, metod ve govdeyi korur).
 */
function englishRedirect(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl;
  if (pathname !== '/en' && !pathname.startsWith('/en/')) return null;

  const rest = pathname.slice('/en'.length);
  const target = new URL(`/tr${rest}${search}`, request.url);
  return NextResponse.redirect(target, 308);
}

export default function proxy(request: NextRequest) {
  return englishRedirect(request) ?? intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
