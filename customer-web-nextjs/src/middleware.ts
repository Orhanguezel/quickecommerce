import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const protectedPaths = [
  "/hesabim",
  "/siparislerim",
  "/siparis",
  "/favorilerim",
  "/adreslerim",
  "/cuzdan",
  "/destek",
  "/odeme",
];

// Routes that should redirect to home if already authenticated
const authPaths = ["/giris", "/kayit", "/sifremi-unuttum"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // Extract locale-less path (e.g., /tr/giris → /giris)
  const pathWithoutLocale = pathname.replace(/^\/(tr|en)/, "") || "/";

  // Redirect authenticated users away from auth pages
  if (token && authPaths.some((p) => pathWithoutLocale.startsWith(p))) {
    const locale = pathname.startsWith("/en") ? "en" : "tr";
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Redirect unauthenticated users to login from protected pages
  if (!token && protectedPaths.some((p) => pathWithoutLocale.startsWith(p))) {
    const locale = pathname.startsWith("/en") ? "en" : "tr";
    const loginUrl = new URL(`/${locale}/giris`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
