"use client";

import type { Product, Slider } from "@/modules/product/product.type";
import type { Category } from "@/modules/site/site.type";
import { HeroSlider } from "@/components/home/hero-slider";
import { CategorySection } from "@/components/home/category-section";
import { ProductSection } from "@/components/home/product-section";
import { SectionHeader } from "@/components/home/section-header";

interface HomeData {
  sliders: Slider[];
  categories: Category[];
  featured: Product[];
  newArrivals: Product[];
  bestSelling: Product[];
  trending: Product[];
  topDeals: Product[];
  popular: Product[];
}

interface HomeTranslations {
  featured_title: string;
  featured_subtitle: string;
  new_arrivals_title: string;
  new_arrivals_subtitle: string;
  best_selling_title: string;
  best_selling_subtitle: string;
  trending_title: string;
  trending_subtitle: string;
  top_deals_title: string;
  top_deals_subtitle: string;
  popular_title: string;
  popular_subtitle: string;
  categories_title: string;
  categories_subtitle: string;
}

interface HomePageClientProps {
  data: HomeData;
  translations: HomeTranslations;
}

export function HomePageClient({ data, translations: t }: HomePageClientProps) {
  return (
    <div className="container space-y-10 py-6">
      {/* Hero Slider */}
      <HeroSlider sliders={data.sliders} />

      {/* Categories */}
      {data.categories.length > 0 && (
        <section>
          <SectionHeader
            title={t.categories_title}
            subtitle={t.categories_subtitle}
          />
          <CategorySection categories={data.categories} />
        </section>
      )}

      {/* Featured Products */}
      <ProductSection
        title={t.featured_title}
        subtitle={t.featured_subtitle}
        products={data.featured}
      />

      {/* Top Deals */}
      <ProductSection
        title={t.top_deals_title}
        subtitle={t.top_deals_subtitle}
        products={data.topDeals}
      />

      {/* New Arrivals */}
      <ProductSection
        title={t.new_arrivals_title}
        subtitle={t.new_arrivals_subtitle}
        products={data.newArrivals}
      />

      {/* Best Selling */}
      <ProductSection
        title={t.best_selling_title}
        subtitle={t.best_selling_subtitle}
        products={data.bestSelling}
      />

      {/* Trending */}
      <ProductSection
        title={t.trending_title}
        subtitle={t.trending_subtitle}
        products={data.trending}
      />

      {/* Popular */}
      <ProductSection
        title={t.popular_title}
        subtitle={t.popular_subtitle}
        products={data.popular}
      />
    </div>
  );
}
