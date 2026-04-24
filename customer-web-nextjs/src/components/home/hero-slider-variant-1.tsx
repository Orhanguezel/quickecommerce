'use client';

import type { Slider } from '@/modules/product/product.type';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface HeroSliderProps {
  sliders: Slider[];
}

export function HeroSliderVariant1({ sliders }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const startAutoPlay = useCallback(() => {
    if (sliders.length <= 1 || timerRef.current) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliders.length);
    }, 8000);
  }, [sliders.length]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    stopAutoPlay();
    startAutoPlay();
  }, [isTransitioning, stopAutoPlay, startAutoPlay]);

  const next = useCallback(() => {
    goTo((current + 1) % sliders.length);
  }, [current, sliders.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + sliders.length) % sliders.length);
  }, [current, sliders.length, goTo]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    stopAutoPlay();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold) next();
    else if (diff < -threshold) prev();
    startAutoPlay();
  };

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsTransitioning(false), 700);
    return () => clearTimeout(timeout);
  }, [current]);

  if (!sliders.length) return null;

  return (
    <section className="relative" aria-label="Hero slider">
      <div
        className="overflow-hidden rounded-lg bg-muted"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(-${current * 100}%)`,
            transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {sliders.map((slide, index) => {
            const backgroundImage = slide.bg_image_url || slide.image_url;

            return (
              <div
                key={slide.id}
                className="relative min-h-[300px] w-full shrink-0 overflow-hidden sm:aspect-[1320/420] sm:min-h-0"
                style={{
                  backgroundColor: slide.bg_color || 'hsl(var(--muted))',
                }}
              >
                {backgroundImage ? (
                  <Image
                    src={backgroundImage}
                    alt=""
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                ) : null}

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(90deg, hsl(var(--foreground) / 0.78) 0%, hsl(var(--foreground) / 0.48) 46%, hsl(var(--foreground) / 0.10) 100%)',
                  }}
                />

                <div className="relative z-10 flex h-full min-h-[300px] max-w-[660px] flex-col justify-center px-7 py-8 sm:px-12 lg:px-14">
                  {slide.sub_title && (
                    <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-primary-foreground shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                      {slide.sub_title}
                    </span>
                  )}

                  {slide.title && (
                    <h2 className="max-w-[600px] text-3xl font-extrabold leading-[1.06] tracking-tight text-background drop-shadow-md sm:text-4xl lg:text-5xl">
                      {slide.title}
                    </h2>
                  )}

                  {slide.description && (
                    <p className="mt-4 max-w-[540px] text-sm font-medium leading-relaxed text-background/95 drop-shadow-sm sm:text-base">
                      {slide.description}
                    </p>
                  )}

                  {slide.button_text && slide.redirect_url && (
                    <Link
                      href={slide.redirect_url}
                      title={slide.button_text || slide.title}
                      className="mt-7 inline-flex w-fit items-center gap-2 rounded-[4px] bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {slide.button_text}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sliders.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md transition-colors hover:bg-primary hover:text-primary-foreground"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md transition-colors hover:bg-primary hover:text-primary-foreground"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {sliders.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
          {sliders.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === current
                  ? 'w-8 bg-primary'
                  : 'w-5 bg-background/60 hover:bg-background/90'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
