"use client";

import type { Product, Slider } from "@/modules/product/product.type";
import type { Category } from "@/modules/site/site.type";
import type { FlashDeal } from "@/modules/flash-deal/flash-deal.type";
import { HeroSlider } from "@/components/home/hero-slider";
import { CategorySection } from "@/components/home/category-section";
import { ProductSection } from "@/components/home/product-section";
import { SectionHeader } from "@/components/home/section-header";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { BannerSection } from "@/components/home/banner-section";
import { TopStoresSection } from "@/components/home/top-stores-section";
import { FlashSaleSection } from "@/components/home/flash-sale-section";
import { useThemeConfig } from "@/modules/theme/use-theme-config";

interface HomeData {
  sliders: Slider[];
  categories: Category[];
  featured: Product[];
  newArrivals: Product[];
  bestSelling: Product[];
  trending: Product[];
  flashDeals: FlashDeal[];
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
  top_stores_title: string;
  newsletter_title: string;
  newsletter_subtitle: string;
}

interface HomePageClientProps {
  data: HomeData;
  translations: HomeTranslations;
}

export function HomePageClient({ data, translations: t }: HomePageClientProps) {
  const { homeConfig } = useThemeConfig();

  return (
    <div className="container space-y-10 py-6">
      {/* Hero Slider - Tema kontrolü */}
      {homeConfig.isSliderEnabled && <HeroSlider sliders={data.sliders} />}

      {/* Categories - Tema kontrolü + başlıklar */}
      {homeConfig.isCategoriesEnabled && data.categories.length > 0 && (
        <section>
          <SectionHeader
            title={homeConfig.categoriesTitle || t.categories_title}
            subtitle={homeConfig.categoriesSubtitle || t.categories_subtitle}
          />
          <CategorySection categories={data.categories} />
        </section>
      )}

      {/* Flash Sale Section (carousel with countdown) */}
      {homeConfig.isFlashSaleEnabled && data.flashDeals.length > 0 && (
        <section>
          <SectionHeader
            title={homeConfig.flashSaleTitle || t.top_deals_title}
            subtitle={homeConfig.flashSaleSubtitle || t.top_deals_subtitle}
          />
          <FlashSaleSection flashDeals={data.flashDeals} />
        </section>
      )}

      {/* Featured Products */}
      {homeConfig.isFeaturedEnabled && (
        <ProductSection
          title={homeConfig.featuredTitle || t.featured_title}
          subtitle={homeConfig.featuredSubtitle || t.featured_subtitle}
          products={data.featured}
        />
      )}

      {/* Banner Section */}
      {homeConfig.isBannerEnabled && (
        <BannerSection />
      )}

      

      {/* New Arrivals (product_latest mapping) */}
      {homeConfig.isLatestEnabled && (
        <ProductSection
          title={homeConfig.latestTitle || t.new_arrivals_title}
          subtitle={homeConfig.latestSubtitle || t.new_arrivals_subtitle}
          products={data.newArrivals}
        />
      )}

      {/* Best Selling (product_top_selling mapping) */}
      {homeConfig.isTopSellingEnabled && (
        <ProductSection
          title={homeConfig.topSellingTitle || t.best_selling_title}
          subtitle={homeConfig.topSellingSubtitle || t.best_selling_subtitle}
          products={data.bestSelling}
        />
      )}

      {/* Trending - Backend'de karşılığı yok, çıkarıldı */}

      {/* Popular */}
      {homeConfig.isPopularEnabled && (
        <ProductSection
          title={homeConfig.popularTitle || t.popular_title}
          subtitle={homeConfig.popularSubtitle || t.popular_subtitle}
          products={data.popular}
        />
      )}

      {/* Top Stores */}
      {homeConfig.isTopStoresEnabled && (
        <TopStoresSection
          title={homeConfig.topStoresTitle || t.top_stores_title || "Popüler Mağazalar"}
        />
      )}

      {/* Newsletter */}
      {homeConfig.isNewsletterEnabled && (
        <NewsletterSection
          title={homeConfig.newsletterTitle || t.newsletter_title || "Bülten"}
          subtitle={homeConfig.newsletterSubtitle || t.newsletter_subtitle}
        />
      )}
    </div>
  );
}
