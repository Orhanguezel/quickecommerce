'use client';

import { useState, useEffect } from 'react';
import type { Slider } from '@/modules/product/product.type';
import { useThemeConfig } from '@/modules/theme/use-theme-config';
import { HeroSliderVariant1 } from './hero-slider-variant-1';
import { HeroSliderVariant2 } from './hero-slider-variant-2';

interface HeroSliderProps {
  sliders: Slider[];
}

/**
 * Hero Slider Variant Selector
 * Tema ayarlarına göre farklı slider varyantları gösterir
 *
 * Mevcut Varyantlar:
 * - "1": Klasik — sol metin, sağ görsel, dot pagination
 * - "2": Modern — dekoratif şekiller, dashed-line pagination, drop-shadow görsel
 */
export function HeroSlider({ sliders }: HeroSliderProps) {
  const { homeConfig, isLoading } = useThemeConfig();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Server'da ve client hydration'da aynı default'u render et
  // Theme yüklendikten sonra doğru variant'a geç
  if (!isMounted || isLoading) {
    return <HeroSliderVariant1 sliders={sliders} />;
  }

  switch (homeConfig.sliderNumber) {
    case '02':
    case '2':
      return <HeroSliderVariant2 sliders={sliders} />;

    case '01':
    case '1':
    default:
      return <HeroSliderVariant1 sliders={sliders} />;
  }
}
