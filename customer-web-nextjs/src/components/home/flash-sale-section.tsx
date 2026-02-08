"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import type { FlashDeal } from "@/modules/flash-deal/flash-deal.type";
import { Button } from "@/components/ui/button";

interface FlashSaleSectionProps {
  flashDeals: FlashDeal[];
}

export function FlashSaleSection({ flashDeals }: FlashSaleSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || flashDeals.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % flashDeals.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, flashDeals.length]);

  if (!flashDeals || flashDeals.length === 0) {
    return null;
  }

  const currentDeal = flashDeals[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + flashDeals.length) % flashDeals.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flashDeals.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative w-full">
      <div
        className="relative h-[400px] md:h-[300px] rounded-xl overflow-hidden"
        style={{ backgroundColor: currentDeal.background_color || "#1a1a1a" }}
      >
        {/* Background Cover Image */}
        {currentDeal.cover_image_url && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={currentDeal.cover_image_url}
              alt={currentDeal.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Content */}
        <div className="relative h-full container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 h-full">
            {/* Left: Product Image */}
            {currentDeal.image_url && (
              <div className="relative w-full md:w-[200px] h-[180px] flex-shrink-0">
                <Image
                  src={currentDeal.image_url}
                  alt={currentDeal.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}

            {/* Center: Title, Description, Timer */}
            <div className="flex-1 text-center md:text-left space-y-4">
              {/* Title */}
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ color: currentDeal.title_color || "#ffffff" }}
              >
                {currentDeal.title}
              </h2>

              {/* Description */}
              {currentDeal.description && (
                <p
                  className="text-sm md:text-base"
                  style={{ color: currentDeal.description_color || "#cccccc" }}
                >
                  {currentDeal.description}
                </p>
              )}

              {/* Countdown Timer */}
              <div className="flex justify-center md:justify-start">
                <CountdownTimer
                  endTime={currentDeal.end_time}
                  bgColor={currentDeal.timer_bg_color}
                  textColor={currentDeal.timer_text_color}
                />
              </div>

              {/* Button */}
              {currentDeal.button_text && currentDeal.button_url && (
                <div className="flex justify-center md:justify-start">
                  <Link href={currentDeal.button_url}>
                    <Button
                      className="px-6 py-3 rounded-lg font-semibold transition-colors"
                      style={{
                        backgroundColor: currentDeal.button_bg_color || "#ffffff",
                        color: currentDeal.button_text_color || "#000000",
                      }}
                      onMouseEnter={(e) => {
                        if (currentDeal.button_hover_color) {
                          e.currentTarget.style.backgroundColor = currentDeal.button_hover_color;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = currentDeal.button_bg_color || "#ffffff";
                      }}
                    >
                      {currentDeal.button_text}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {flashDeals.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
              aria-label="Previous deal"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
              aria-label="Next deal"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {flashDeals.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {flashDeals.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to deal ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
