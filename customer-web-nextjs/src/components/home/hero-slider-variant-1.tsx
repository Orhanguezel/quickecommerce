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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isManualViewport, setIsManualViewport] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const startAutoPlay = useCallback(() => {
    if (isManualViewport || sliders.length <= 1 || timerRef.current) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliders.length);
    }, 8000);
  }, [isManualViewport, sliders.length]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const updateManualMode = () => {
      const shouldUseManualMode = media.matches;
      setIsManualViewport(shouldUseManualMode);
      if (shouldUseManualMode) stopAutoPlay();
    };

    updateManualMode();
    media.addEventListener('change', updateManualMode);
    return () => media.removeEventListener('change', updateManualMode);
  }, [stopAutoPlay]);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDragOffset(0);
    setIsDragging(false);
    isDraggingRef.current = false;
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
    if (sliders.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    setDragOffset(0);
    setIsDragging(true);
    isDraggingRef.current = true;
    stopAutoPlay();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || sliders.length <= 1) return;
    const currentX = e.touches[0].clientX;
    const offset = currentX - touchStartX.current;
    const slideWidth = viewportRef.current?.clientWidth || window.innerWidth;
    const maxOffset = slideWidth * 0.85;

    touchEndX.current = currentX;
    setDragOffset(Math.max(-maxOffset, Math.min(maxOffset, offset)));
  };

  const onTouchEnd = () => {
    if (!isDraggingRef.current || sliders.length <= 1) return;
    const offset = touchEndX.current - touchStartX.current;
    const slideWidth = viewportRef.current?.clientWidth || window.innerWidth;
    const threshold = Math.min(90, slideWidth * 0.18);

    setIsDragging(false);
    isDraggingRef.current = false;
    setDragOffset(0);

    if (offset < -threshold) next();
    else if (offset > threshold) prev();
    else if (!isManualViewport) startAutoPlay();
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
    <section className="relative overflow-hidden" aria-label="Hero slider">
      <div
        ref={viewportRef}
        className="touch-pan-y overflow-hidden rounded-lg bg-muted"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div
          className="flex w-full"
          style={{
            transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {sliders.map((slide, index) => {
            const backgroundImage = slide.bg_image_url || slide.image_url;

            return (
              <div
                key={slide.id}
                className="relative min-h-[300px] w-full min-w-0 shrink-0 basis-full overflow-hidden sm:aspect-[1320/420] sm:min-h-0"
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

                <div className="relative z-10 flex h-full min-h-[300px] w-full max-w-[660px] min-w-0 flex-col justify-center px-5 py-8 sm:px-12 lg:px-14">
                  {slide.sub_title && (
                    <span className="mb-4 inline-flex max-w-full w-fit items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-primary-foreground shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                      <span className="min-w-0 truncate">{slide.sub_title}</span>
                    </span>
                  )}

                  {slide.title && (
                    <h2 className="max-w-full break-words text-2xl font-extrabold leading-[1.08] text-background sm:max-w-[600px] sm:text-4xl lg:text-5xl">
                      {slide.title}
                    </h2>
                  )}

                  {slide.description && (
                    <p className="mt-4 max-w-full text-sm font-medium leading-relaxed text-background/95 sm:max-w-[540px] sm:text-base">
                      {slide.description}
                    </p>
                  )}

                  {slide.button_text && slide.redirect_url && (
                    <Link
                      href={slide.redirect_url}
                      title={slide.button_text || slide.title}
                      className="mt-7 inline-flex max-w-full w-fit items-center justify-center gap-2 rounded-[4px] bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:px-6"
                    >
                      <span className="min-w-0 truncate">{slide.button_text}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
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
            className="absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md transition-colors hover:bg-primary hover:text-primary-foreground lg:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md transition-colors hover:bg-primary hover:text-primary-foreground lg:flex"
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
