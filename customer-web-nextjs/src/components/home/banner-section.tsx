"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useBannerQuery } from "@/modules/banner/banner.action";
import type { Banner } from "@/modules/banner/banner.type";

const FALLBACK_IMAGE = "/images/banner-illustration.png";

function BannerCard({ banner, tall = false }: { banner: Banner; tall?: boolean }) {
  const bgColor = banner.background_color || "#EEF2F7";
  const btnColor = banner.button_color || "#3F51B5";
  const btnTextColor = banner.button_text_color || "#ffffff";
  const btnHoverColor = banner.button_hover_color || btnColor;
  const titleColor = banner.title_color || "#1E293B";
  const descColor = banner.description_color || "#64748B";
  const image = banner.thumbnail_image || FALLBACK_IMAGE;

  return (
    <div
      className="group overflow-hidden rounded-2xl"
      style={{ backgroundColor: bgColor }}
    >
      <div className={`flex items-center ${tall ? "min-h-[200px]" : "min-h-[170px]"}`}>
        {/* Text — left */}
        <div className="flex flex-1 flex-col justify-center px-6 py-6 md:px-8">
          <h3
            className={`mb-1 font-bold leading-tight ${tall ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}
            style={{ color: titleColor }}
          >
            {banner.title}
          </h3>
          {banner.description && (
            <p
              className={`mb-4 line-clamp-2 ${tall ? "text-sm md:text-base" : "text-xs md:text-sm"}`}
              style={{ color: descColor }}
            >
              {banner.description}
            </p>
          )}
          {banner.redirect_url && (
            <div>
              <Link
                href={banner.redirect_url}
                className="group/btn inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: btnColor, color: btnTextColor }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = btnHoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = btnColor)}
              >
                {banner.button_text || "Shop Now"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Image — right */}
        <div className={`relative hidden shrink-0 md:block ${tall ? "h-[200px] w-[300px]" : "h-[150px] w-[180px]"}`}>
          <Image
            src={image}
            alt={banner.title}
            fill
            className="object-contain object-right-bottom"
            sizes={tall ? "300px" : "180px"}
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}

export function BannerSection() {
  const { banners, isPending: isLoading } = useBannerQuery();

  if (!isLoading && banners.length === 0) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[200px] animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[170px] animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // Split banners into rows: 1 full-width + 3 columns + 2 columns
  const hero = banners[0];
  const row3 = banners.slice(1, 4);
  const row2 = banners.slice(4, 6);

  return (
    <div className="space-y-4">
      {/* Row 1: Full-width banner */}
      {hero && <BannerCard banner={hero} tall />}

      {/* Row 2: 3-column grid */}
      {row3.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {row3.map((b) => (
            <BannerCard key={b.id} banner={b} />
          ))}
        </div>
      )}

      {/* Row 3: 2-column grid */}
      {row2.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {row2.map((b) => (
            <BannerCard key={b.id} banner={b} />
          ))}
        </div>
      )}
    </div>
  );
}
