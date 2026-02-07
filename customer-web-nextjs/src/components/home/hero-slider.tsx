'use client';

import type { Slider } from '@/modules/product/product.type';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSliderProps {
  sliders: Slider[];
}

export function HeroSlider({ sliders }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % sliders.length);
  }, [sliders.length]);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  useEffect(() => {
    if (sliders.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, sliders.length]);

  if (!sliders.length) return null;

  const slide = sliders[current];

  return (
    <section className="relative overflow-hidden rounded-xl" aria-label="Hero slider">
      <div
        className="relative flex min-h-[300px] items-center sm:min-h-[400px]"
        style={{ backgroundColor: slide.bg_color || '#f8f9fa' }}
      >
        {/* Background Image */}
        {slide.bg_image_url && (
          <Image
            src={slide.bg_image_url}
            alt=""
            fill
            className="object-cover"
            priority={current === 0}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex w-full items-center justify-between px-6 sm:px-12">
          <div className="max-w-lg space-y-4">
            {slide.title && (
              <h2
                className="text-3xl font-bold sm:text-4xl lg:text-5xl"
                style={{ color: slide.title_color || '#000' }}
              >
                {slide.title}
              </h2>
            )}
            {slide.sub_title && (
              <p className="text-lg sm:text-xl" style={{ color: slide.sub_title_color || '#666' }}>
                {slide.sub_title}
              </p>
            )}
            {slide.button_text && slide.redirect_url && (
              <a href={slide.redirect_url}>
                <Button
                  className="mt-2"
                  style={{
                    backgroundColor: slide.button_bg_color || undefined,
                    color: slide.button_text_color || undefined,
                  }}
                >
                  {slide.button_text}
                </Button>
              </a>
            )}
          </div>

          {/* Slide Image */}
          {slide.image_url && (
            <div className="hidden sm:block">
              <Image
                src={slide.image_url}
                alt={slide.title || 'Slider'}
                width={400}
                height={300}
                className="h-auto max-h-[300px] w-auto object-contain"
                priority={current === 0}
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition hover:bg-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition hover:bg-white"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {sliders.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {sliders.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-6 bg-primary' : 'w-2 bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
