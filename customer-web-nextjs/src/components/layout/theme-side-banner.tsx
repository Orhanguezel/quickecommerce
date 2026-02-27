"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useBannerQuery } from "@/modules/banner/banner.action";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import { X } from "lucide-react";

const SUPPORTED_LOCALES = ["tr", "en"];

/** URL'e locale ekler. Zaten varsa dokunmaz. */
function injectLocaleIntoUrl(url: string, locale: string): string {
  if (!url) return url;
  const alreadyHasLocale = SUPPORTED_LOCALES.some(
    (l) => url.includes(`/${l}/`) || url.endsWith(`/${l}`)
  );
  if (alreadyHasLocale) return url;
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const parsed = new URL(url);
      parsed.pathname = `/${locale}${parsed.pathname}`;
      return parsed.toString();
    }
    const path = url.startsWith("/") ? url : `/${url}`;
    return `/${locale}${path}`;
  } catch {
    return url;
  }
}

export function ThemeSideBanner() {
  const locale = useLocale();
  const pathname = usePathname();
  const { banners } = useBannerQuery();
  const { sideBannerConfig } = useThemeConfig();
  const [isDismissed, setIsDismissed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const roRef = useRef<ResizeObserver | null>(null);

  const normalizedPath = (pathname || "").replace(/\/+$/, "");
  const segments = normalizedPath.split("/").filter(Boolean);
  const isHome = segments.length === 1 && segments[0] === locale;
  const isProduct = segments.includes("urun") || segments.includes("product");
  const hasBanners = Array.isArray(banners) && banners.length > 0;
  const selectedBanner = hasBanners ? banners[sideBannerConfig.bannerOrder - 1] : null;
  const storageKey = useMemo(
    () => `theme_side_banner_dismissed:${locale}:${sideBannerConfig?.id || "left_sticky_banner_1"}`,
    [locale, sideBannerConfig?.id]
  );

  // Header yüksekliğini dinamik ölç — sticky wrapper'ı bul
  useEffect(() => {
    const measure = () => {
      const el = document.querySelector<HTMLElement>(".sticky.w-full");
      if (el) setHeaderHeight(el.getBoundingClientRect().height);
    };
    measure();
    const el = document.querySelector<HTMLElement>(".sticky.w-full");
    if (el) {
      roRef.current = new ResizeObserver(measure);
      roRef.current.observe(el);
    }
    return () => {
      roRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let nextDismissed = false;
    if (
      sideBannerConfig?.isEnabled &&
      sideBannerConfig.dismissible &&
      sideBannerConfig.dismissPolicy !== "always"
    ) {
      if (sideBannerConfig.dismissPolicy === "session") {
        nextDismissed = Boolean(sessionStorage.getItem(storageKey));
      } else {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const dismissedAt = Number(raw);
          if (Number.isFinite(dismissedAt)) {
            const daysMs = Math.max(1, sideBannerConfig.dismissDays) * 24 * 60 * 60 * 1000;
            const withinWindow = Date.now() - dismissedAt < daysMs;
            if (!withinWindow) {
              localStorage.removeItem(storageKey);
            }
            nextDismissed = withinWindow;
          }
        }
      }
    }
    const timeoutId = window.setTimeout(() => setIsDismissed(nextDismissed), 0);
    return () => window.clearTimeout(timeoutId);
  }, [
    sideBannerConfig?.isEnabled,
    sideBannerConfig.dismissDays,
    sideBannerConfig.dismissPolicy,
    sideBannerConfig.dismissible,
    storageKey,
  ]);

  if (!sideBannerConfig?.isEnabled) return null;
  if (sideBannerConfig.pageTarget === "home" && !isHome) return null;
  if (sideBannerConfig.pageTarget === "product" && !isProduct) return null;
  if (!selectedBanner) return null;

  if (isDismissed) return null;

  const imageSrc =
    selectedBanner.thumbnail_image ||
    selectedBanner.background_image ||
    "/images/banner-illustration.png";

  // URL'ye aktif locale'yi enjekte et (eğer zaten yoksa)
  const rawHref = sideBannerConfig.linkUrl || selectedBanner.redirect_url || "";
  const linkHref = injectLocaleIntoUrl(rawHref, locale);
  const computedWidth = Math.max(220, Number(sideBannerConfig.widthPx || 220));
  const computedHeight = Math.max(420, Math.round(computedWidth * 2.1));

  const content = (
    <div
      className="relative overflow-hidden rounded-2xl border shadow-md"
      style={{
        width: `${computedWidth}px`,
        minHeight: `${computedHeight}px`,
        backgroundColor: selectedBanner.background_color || "#F6F9FE",
      }}
    >
      {sideBannerConfig.dismissible ? (
        <button
          type="button"
          aria-label="Close banner"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (sideBannerConfig.dismissPolicy === "session") {
              sessionStorage.setItem(storageKey, "1");
            } else if (sideBannerConfig.dismissPolicy === "days") {
              localStorage.setItem(storageKey, String(Date.now()));
            }
            setIsDismissed(true);
          }}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1 text-white"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
      <div className="flex h-full flex-col justify-between gap-3 p-3">
        <div className="space-y-2">
          <h3
            className="line-clamp-3 text-base font-bold leading-snug"
            style={{ color: selectedBanner.title_color || "#1E293B" }}
          >
            {selectedBanner.title || sideBannerConfig.title || "Kampanya"}
          </h3>
          {selectedBanner.description ? (
            <p
              className="line-clamp-4 text-xs leading-relaxed"
              style={{ color: selectedBanner.description_color || "#475569" }}
            >
              {selectedBanner.description}
            </p>
          ) : null}
        </div>

        {selectedBanner.button_text ? (
          <span
            className="inline-flex w-full items-center justify-center rounded-full px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: selectedBanner.button_color || "#0E5ABC",
              color: selectedBanner.button_text_color || "#FFFFFF",
            }}
          >
            {selectedBanner.button_text}
          </span>
        ) : null}

        <div className="relative mt-1 w-full flex-1">
          <div className="relative h-full min-h-[210px] w-full">
            <Image
              src={imageSrc}
              alt={sideBannerConfig.title || selectedBanner.title || "side-banner"}
              fill
              className="object-contain object-bottom"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Header altından viewport sonuna kadar uzanan wrapper — banner bu alan içinde dikey ortalanır
  const safeHeaderHeight = headerHeight > 0 ? headerHeight : 220;

  return (
    <div
      className="pointer-events-none fixed left-3 z-[55] hidden xl:flex xl:flex-col xl:items-start xl:justify-center"
      style={{
        top: `calc(var(--theme-popup-top-offset, 0px) + ${safeHeaderHeight}px)`,
        height: `calc(100svh - var(--theme-popup-top-offset, 0px) - ${safeHeaderHeight}px)`,
      }}
    >
      <div className="pointer-events-auto">
        {linkHref ? (
          <a
            href={linkHref}
            target={sideBannerConfig.openInNewTab ? "_blank" : "_self"}
            rel={sideBannerConfig.openInNewTab ? "nofollow noopener noreferrer" : "nofollow"}
            className="block"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
