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
    if (sliders.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliders.length);
    }, 8000); // 8sn interval (Flutter ile aynı)
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

  // Touch swipe handlers
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

  // 2sn animasyon lock (Flutter: autoPlayAnimationDuration)
  useEffect(() => {
    const timeout = setTimeout(() => setIsTransitioning(false), 2000);
    return () => clearTimeout(timeout);
  }, [current]);

  if (!sliders.length) return null;

  return (
    <section className="relative" aria-label="Hero slider">
      {/* Slider Track */}
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            transform: `translateX(-${current * 100}%)`,
            transition: 'transform 2000ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {sliders.map((slide, i) => (
            <div
              key={slide.id}
              className="relative flex w-full shrink-0 items-center"
              style={{
                minHeight: 'clamp(260px, 38vw, 500px)',
                backgroundColor: slide.bg_image_url
                  ? undefined
                  : slide.bg_color || undefined,
              }}
            >
              {/* Background Image (cover) veya bg_color */}
              {slide.bg_image_url ? (
                <Image
                  src={slide.bg_image_url}
                  alt=""
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
              ) : !slide.bg_color ? (
                <div className="absolute inset-0 bg-muted" />
              ) : null}

              {/* Content Row: sol metin (%50) + sağ görsel (%40) + padding (%3+%3) */}
              <div className="relative z-10 flex w-full items-center px-[5%] py-8">
                {/* Sol - Metin İçeriği */}
                <div className="flex w-full flex-col justify-center sm:w-1/2">
                  {slide.sub_title && (
                    <p
                      className="mb-2 text-sm font-medium text-primary sm:text-base lg:text-lg"
                      style={slide.sub_title_color ? { color: slide.sub_title_color } : undefined}
                    >
                      {slide.sub_title}
                    </p>
                  )}

                  {slide.title && (
                    <h2
                      className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-[42px]"
                      style={slide.title_color ? { color: slide.title_color } : undefined}
                    >
                      {slide.title}
                    </h2>
                  )}

                  {slide.description && (
                    <p
                      className="mt-4 line-clamp-2 text-sm text-muted-foreground sm:text-base lg:text-lg"
                      style={slide.description_color ? { color: slide.description_color } : undefined}
                    >
                      {slide.description}
                    </p>
                  )}

                  {slide.button_text && slide.redirect_url && (
                    <div className="mt-5">
                      <Link href={slide.redirect_url}>
                        <span
                          className="inline-flex items-center gap-2 rounded-[5px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground sm:px-6 sm:py-3.5 sm:text-base lg:text-lg"
                          style={{
                            ...(slide.button_bg_color ? { backgroundColor: slide.button_bg_color } : {}),
                            ...(slide.button_text_color ? { color: slide.button_text_color } : {}),
                          }}
                        >
                          {slide.button_text}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Sağ - Ürün Görseli (%40 genişlik, 300px max yükseklik) */}
                {slide.image_url && (
                  <div className="hidden w-[40%] items-center justify-center sm:flex">
                    <Image
                      src={slide.image_url}
                      alt={slide.title || 'Slider'}
                      width={500}
                      height={300}
                      className="h-auto max-h-[400px] w-auto object-contain"
                      priority={i === 0}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - minimal, sadece chevron */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 p-1 text-primary transition-opacity hover:opacity-70"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 p-1 text-primary transition-opacity hover:opacity-70"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dot Indicators - Flutter birebir: aktif 24px, pasif 9px, 3px yükseklik */}
      {sliders.length > 1 && (
        <div className="flex items-center justify-center gap-1 py-2.5">
          {sliders.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`mx-0.5 h-[3px] rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-primary'
                  : 'w-[9px] bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
