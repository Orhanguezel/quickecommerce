"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useBannerQuery } from "@/modules/banner/banner.action";
import type { Banner } from "@/modules/banner/banner.type";

const FALLBACK_IMAGE = "/images/banner-illustration.png";

function BannerCard({ banner, tall = false }: { banner: Banner; tall?: boolean }) {
  const bgColor = banner.background_color || "#F6F9FE";
  const btnColor = banner.button_color || "#0E5ABC";
  const btnTextColor = banner.button_text_color || "#FFFFFF";
  const btnHoverColor = banner.button_hover_color || btnColor;
  const titleColor = banner.title_color || "#1E293B";
  const descColor = banner.description_color || "#475569";
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
                title={banner.button_text || banner.title}
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

interface BannerSectionProps {
  rows?: number[];
}

export function BannerSection({ rows }: BannerSectionProps = {}) {
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

  const rowsMap = new Map<number, Banner[]>();
  const filteredBanners =
    rows && rows.length > 0
      ? banners.filter((banner) => rows.includes(banner.desktop_row ?? 1))
      : banners;

  if (!isLoading && filteredBanners.length === 0) return null;

  filteredBanners.forEach((banner) => {
    const row = banner.desktop_row ?? 1;
    const list = rowsMap.get(row) ?? [];
    list.push(banner);
    rowsMap.set(row, list);
  });

  const rowGroups = [...rowsMap.entries()].sort((a, b) => a[0] - b[0]);

  const getColsClass = (cols: number) => {
    const safe = Math.max(1, Math.min(3, cols));
    if (safe === 1) return "md:grid-cols-1";
    if (safe === 2) return "md:grid-cols-2";
    return "md:grid-cols-3";
  };

  return (
    <div className="space-y-4">
      {rowGroups.map(([rowNo, rowBanners]) => {
        const desktopColumns = rowBanners[0]?.desktop_columns ?? 3;
        const colsClass = getColsClass(desktopColumns);
        const isTall = desktopColumns === 1;

        return (
          <div key={rowNo} className={`grid gap-4 ${colsClass}`}>
            {rowBanners.map((b) => (
              <BannerCard key={b.id} banner={b} tall={isTall} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
