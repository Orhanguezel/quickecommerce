"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { CountdownTimer } from "./countdown-timer";
import { ProductCard } from "@/components/product/product-card";
import type { FlashDeal } from "@/modules/flash-deal/flash-deal.type";
import type { Product } from "@/modules/product/product.type";

interface FlashSaleSectionProps {
  flashDeals: FlashDeal[];
  products?: Product[];
}

export function FlashSaleSection({ flashDeals, products = [] }: FlashSaleSectionProps) {
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

  const displayProducts = products.slice(0, 4);

  return (
    <div className="flex w-full flex-col gap-3 md:h-[330px] md:flex-row">
      {/* Left: Banner Carousel (flex 4 in Flutter) */}
      <div className="h-[280px] w-full md:w-[40%]">
        <div className="relative h-full w-full overflow-hidden rounded-[5px]">
          {/* Sliding Track — all deals side by side, translateX to slide */}
          <div
            className="flex h-full"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: "transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {flashDeals.map((deal) => (
              <div
                key={deal.id}
                className="relative h-full w-full shrink-0"
                style={{ backgroundColor: deal.background_color || "#ffffff" }}
              >
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
            ))}
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

      {/* Right: Product Grid (flex 6 in Flutter) — single row, full height */}
      {displayProducts.length > 0 && (
        <div className="flex-1 overflow-hidden">
          <div className="grid h-full auto-cols-fr grid-flow-col gap-2">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
