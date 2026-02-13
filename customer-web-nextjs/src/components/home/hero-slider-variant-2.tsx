'use client';

import type { Slider } from '@/modules/product/product.type';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface HeroSliderProps {
  sliders: Slider[];
}

/** Conditional inline style - only set if API provides a value */
function colorStyle(value: string | undefined | null): React.CSSProperties | undefined {
  return value ? { color: value } : undefined;
}

function bgStyle(value: string | undefined | null): React.CSSProperties | undefined {
  return value ? { backgroundColor: value } : undefined;
}

function DecoShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute left-[8%] top-[15%] h-12 w-12 text-primary/10" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M24 4 L44 40 L4 40 Z" />
      </svg>
      <svg className="absolute left-[48%] top-[10%] h-5 w-5 text-primary/15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8" />
      </svg>
      <svg className="absolute right-[20%] top-[8%] h-4 w-4 text-muted-foreground/15" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="8" r="6" />
      </svg>
      <svg className="absolute right-[12%] top-[25%] h-8 w-8 text-muted-foreground/10" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 4 L28 28 L4 28 Z" />
      </svg>
      <svg className="absolute right-[35%] top-[40%] h-6 w-6 text-primary/[0.08]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      <svg className="absolute bottom-[20%] left-[35%] h-4 w-4 text-muted-foreground/[0.12]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6" />
      </svg>
      <svg className="absolute bottom-[12%] left-[48%] h-3 w-3 text-primary/10" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="6" cy="6" r="5" />
      </svg>
      <svg className="absolute bottom-[8%] right-[25%] h-10 w-10 text-muted-foreground/[0.08]" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 4 L36 32 L4 32 Z" />
      </svg>
    </div>
  );
}

export function HeroSliderVariant2({ sliders }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (sliders.length <= 1) return;
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
    <section className="relative overflow-hidden rounded-2xl" aria-label="Hero slider">
      {/* Slide Track */}
      <div
        className="flex"
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {sliders.map((slide, i) => (
          <div
            key={slide.id}
            className="relative flex min-h-[352px] w-full shrink-0 items-center bg-background sm:min-h-[462px] lg:min-h-[528px]"
            style={bgStyle(slide.bg_color)}
          >
            {/* Background Image */}
            {slide.bg_image_url && (
              <Image
                src={slide.bg_image_url}
                alt=""
                fill
                className="object-cover"
                priority={i === 0}
              />
            )}

            {/* Decorative geometric shapes */}
            <DecoShapes />

            {/* Content Grid */}
            <div className="relative z-10 grid w-full grid-cols-1 items-center gap-6 px-8 sm:grid-cols-2 sm:px-12 lg:px-16">
              {/* Left - Text Content */}
              <div className="space-y-4">
                {slide.sub_title && (
                  <p
                    className="text-sm font-medium tracking-wide text-primary sm:text-base"
                    style={colorStyle(slide.sub_title_color)}
                  >
                    {slide.sub_title}
                  </p>
                )}

                {slide.title && (
                  <h2
                    className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
                    style={colorStyle(slide.title_color)}
                  >
                    {slide.title}
                  </h2>
                )}

                {slide.description && (
                  <p
                    className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
                    style={colorStyle(slide.description_color)}
                  >
                    {slide.description}
                  </p>
                )}

                {slide.button_text && slide.redirect_url && (
                  <Link href={slide.redirect_url}>
                    <button
                      className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg"
                      style={{
                        ...(slide.button_bg_color ? { backgroundColor: slide.button_bg_color } : {}),
                        ...(slide.button_text_color ? { color: slide.button_text_color } : {}),
                      }}
                    >
                      {slide.button_text}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                )}
              </div>

              {/* Right - Product Image */}
              {slide.image_url && (
                <div className="hidden justify-end sm:flex">
                  <Image
                    src={slide.image_url}
                    alt={slide.title || 'Slider'}
                    width={520}
                    height={380}
                    className="h-auto max-h-[385px] w-auto object-contain drop-shadow-xl lg:max-h-[462px]"
                    priority={i === 0}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full p-1.5 text-primary transition-colors hover:bg-primary/10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full p-1.5 text-primary transition-colors hover:bg-primary/10"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dashed Line Pagination */}
      {sliders.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
          {sliders.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 bg-primary'
                  : 'w-4 bg-muted-foreground/25'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
