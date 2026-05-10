const GOOGLE_SITE_VERIFICATION = "google-site-verification: googlec78a9bfe93e092fc.html";

export function GET() {
  return new Response(GOOGLE_SITE_VERIFICATION, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
