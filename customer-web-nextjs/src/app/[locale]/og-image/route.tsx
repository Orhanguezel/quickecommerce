import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * Sayfa basligindan 1200x630 paylasim gorseli uretir: /tr/og-image?title=...
 *
 * Yol bilerek dil onekli: nginx onek tasimayan yollari /tr/... adresine 301 ile
 * yonlendiriyor.
 *
 * Tanitio 2026-09-25: blog, yazar, magazalar, hakkimizda ve iletisim sayfalarinda
 * og:image yoktu; olan sayfalarin hepsi ayni logoyu kullaniyordu, paylasilan
 * kartlar birbirinden ayirt edilemiyordu.
 */
export const runtime = "nodejs";

const API_URL =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "https://sportoonline.com/api/v1";

async function siteTitle(): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/site-general-info`, {
      headers: { "X-localization": "tr" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return data?.site_settings?.com_site_title?.trim() || SITE_NAME;
  } catch {
    return SITE_NAME;
  }
}

function clamp(value: string | null, max: number): string {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteName = await siteTitle();
  const title = clamp(searchParams.get("title"), 90) || siteName;
  const subtitle = clamp(searchParams.get("subtitle"), 120);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #14532d 0%, #15803d 60%, #16a34a 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, opacity: 0.9 }}>
          {siteName}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ display: "flex", fontSize: 32, opacity: 0.85, lineHeight: 1.3 }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", fontSize: 26, opacity: 0.75 }}>
          {/* request.url proxy arkasinda ic adresi (localhost:3003) verir. */}
          {new URL(SITE_URL).host}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "cache-control": "public, max-age=86400, s-maxage=604800" },
    }
  );
}
