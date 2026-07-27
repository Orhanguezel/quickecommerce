import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { getGoneSlugs } from './lib/gone-products';

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

const PRODUCT_PATH = /^\/[a-z]{2}\/urun\/(.+)$/;

/**
 * Katalogdan kalici olarak kaldirilmis urunler icin 404 yerine 410 Gone.
 * 404 "su an yok" (Google tekrar tekrar dener), 410 "kalici olarak yok"
 * (indeksten hizla duser). Liste backend'den gelir ve 1 saat cache'lenir;
 * liste alinamazsa hicbir sey yapilmaz ve akis normal 404'e duser.
 */
async function goneResponse(request: NextRequest): Promise<NextResponse | null> {
  const match = PRODUCT_PATH.exec(request.nextUrl.pathname);
  if (!match) return null;

  let slug = match[1];
  try {
    slug = decodeURIComponent(slug);
  } catch {
    // bozuk encoding — slug'i oldugu gibi dene
  }

  const gone = await getGoneSlugs();
  if (!gone.has(slug)) return null;

  const body = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"/>
<meta name="robots" content="noindex"/>
<title>Ürün kaldırıldı</title></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem">
<h1>Bu ürün artık satışta değil</h1>
<p>Aradığınız ürün katalogdan kalıcı olarak kaldırıldı.</p>
<p><a href="/tr">Ana sayfaya dön</a> &middot; <a href="/tr/urunler">Tüm ürünler</a></p>
</body></html>`;

  return new NextResponse(body, {
    status: 410,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}

export default async function proxy(request: NextRequest) {
  const redirect = englishRedirect(request);
  if (redirect) return redirect;

  const gone = await goneResponse(request);
  if (gone) return gone;

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
