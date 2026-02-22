"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Zap } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import type { FlashDeal } from "@/modules/flash-deal/flash-deal.type";

interface FlashSaleSectionProps {
  flashDeals: FlashDeal[];
  title?: string;
  subtitle?: string;
}

function getDiscountLabel(deal: FlashDeal): string {
  const amount = Number(deal.discount_amount ?? 0);
  if (!amount) return "";

  if (deal.discount_type === "percentage") {
    return `%${Math.round(amount)} INDIRIM`;
  }

  const fixed = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${fixed} TL INDIRIM`;
}

export function FlashSaleSection({ flashDeals, title, subtitle }: FlashSaleSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (flashDeals.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % flashDeals.length);
    }, 5000); // Flutter: autoPlayInterval 5 seconds
  }, [flashDeals.length]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    stopAutoPlay();
    startAutoPlay();
  }, [isTransitioning, stopAutoPlay, startAutoPlay]);

  // Auto-play
  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  // Transition lock (Flutter: autoPlayAnimationDuration 1 second)
  useEffect(() => {
    const timeout = setTimeout(() => setIsTransitioning(false), 1000);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  if (!flashDeals || flashDeals.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      {(title || subtitle) && (
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500 shadow-sm">
            <Zap className="h-5 w-5 fill-white text-white" />
          </span>
          <div>
            {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      )}
    <div className="w-full">
      {/* Banner Carousel */}
      <div className="h-[280px] w-full">
        <div className="relative h-full w-full overflow-hidden rounded-[5px]">
          {/* Sliding Track — all deals side by side, translateX to slide */}
          <div
            className="flex h-full"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: "transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {flashDeals.map((deal) => {
              const discountLabel = getDiscountLabel(deal);

              return (
                <div
                  key={deal.id}
                  className="relative h-full w-full shrink-0"
                  style={{ backgroundColor: deal.background_color || "#ffffff" }}
                >
                  {discountLabel && (
                    <div className="pointer-events-none absolute right-3 top-3 z-20">
                      <div className="rounded-full bg-[radial-gradient(circle_at_30%_20%,#fff7b1_0%,#f59e0b_40%,#dc2626_100%)] px-3 py-1.5 text-center text-xs font-black tracking-[0.06em] text-white shadow-[0_10px_24px_rgba(220,38,38,0.45)] ring-2 ring-white/90 sm:px-4 sm:py-2 sm:text-sm">
                        {discountLabel}
                      </div>
                    </div>
                  )}

                  {/* Background Cover Image */}
                  {deal.cover_image_url && (
                    <div className="absolute inset-0">
                      <Image
                        src={deal.cover_image_url}
                        alt={deal.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Content: Image left + Info right (matching Flutter Row layout) */}
                  <div className="relative flex h-full">
                    {/* Product Image (144px wide in Flutter) */}
                    {deal.image_url && (
                      <div className="relative h-full w-[144px] shrink-0">
                        <Image
                          src={deal.image_url}
                          alt={deal.title}
                          fill
                          className="object-fill"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="w-[10px] shrink-0" />

                    {/* Info Column */}
                    <div className="flex flex-1 flex-col items-start justify-center gap-2 pr-3">
                      {/* Title: Flutter = 14px, w600, letterSpacing 1.0 */}
                      <h3
                        className="line-clamp-2 text-sm font-semibold tracking-wide"
                        style={{ color: deal.title_color || "#000000" }}
                      >
                        {deal.title}
                      </h3>

                      {/* Countdown Timer */}
                      <CountdownTimer
                        endTime={deal.end_time}
                        bgColor={deal.timer_bg_color}
                        textColor={deal.timer_text_color}
                        labelColor={deal.title_color}
                      />

                      {/* Button: Flutter = padding 10v 12h, rounded 5, shadow, 14px w600 */}
                      {deal.button_text && deal.button_url && (
                        <Link href={deal.button_url}>
                          <span
                            className="inline-block rounded-[5px] px-3 py-2.5 text-sm font-semibold tracking-wide shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-colors"
                            style={{
                              backgroundColor: deal.button_bg_color || "#1A73E8",
                              color: deal.button_text_color || "#ffffff",
                            }}
                          >
                            {deal.button_text}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Dots (only if multiple deals) */}
          {flashDeals.length > 1 && (
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {flashDeals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Deal ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
    </section>
  );
}
