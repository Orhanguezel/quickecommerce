'use client';

import type { Slider } from '@/modules/product/product.type';
import { HeroSliderVariant1 } from './hero-slider-variant-1';

interface HeroSliderProps {
  sliders: Slider[];
}

export function HeroSliderVariant2({ sliders }: HeroSliderProps) {
  return <HeroSliderVariant1 sliders={sliders} />;
}
