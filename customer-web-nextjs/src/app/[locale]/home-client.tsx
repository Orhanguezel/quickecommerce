"use client";

import type { Product, Slider } from "@/modules/product/product.type";
import type { Category } from "@/modules/site/site.type";
import type { FlashDeal } from "@/modules/flash-deal/flash-deal.type";
import type { Banner } from "@/modules/banner/banner.type";
import type { BlogPost } from "@/modules/blog/blog.type";
import { HeroSlider } from "@/components/home/hero-slider";
import { CategorySection } from "@/components/home/category-section";
import { ProductSection } from "@/components/home/product-section";
import { SectionHeader } from "@/components/home/section-header";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { TopStoresSection } from "@/components/home/top-stores-section";
import { CountdownTimer } from "@/components/home/countdown-timer";
import { InfiniteProductsSection } from "@/components/home/infinite-products-section";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import { useBannerQuery } from "@/modules/banner/banner.action";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Fragment, type ReactNode } from "react";

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
  blogs: BlogPost[];
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
  blog_title: string;
  blog_subtitle: string;
}

interface HomePageClientProps {
  data: HomeData;
  translations: HomeTranslations;
}

type HomeSectionKey =
  | "slider"
  | "category"
  | "flash_sale"
  | "product_featured"
  | "banner_section"
  | "product_latest"
  | "product_top_selling"
  | "popular_product_section"
  | "blog_section"
  | "top_stores_section"
  | "newsletters_section"
  | "all_products_section";

interface HomeLayoutBlock {
  id?: string;
  type: HomeSectionKey;
  instance?: number;
  enabled_disabled?: "on" | "off";
  config?: {
    banner_span?: 4 | 6 | 12;
    flash_sale_span?: 4 | 6 | 12;
    blog_span?: 4 | 6 | 12;
    top_stores_span?: 4 | 6 | 12;
  };
}

export function HomePageClient({ data, translations: t }: HomePageClientProps) {
  const { homeConfig } = useThemeConfig();
  const { banners, isPending: isBannerLoading } = useBannerQuery();
  const orderedFlashDeals = [...data.flashDeals].sort((a, b) => a.id - b.id);
  const orderedBlogs = [...data.blogs].sort((a, b) => {
    const featuredA = Number(
      (a as BlogPost & { is_featured?: number | boolean; featured?: number | boolean })
        .is_featured ||
        (a as BlogPost & { featured?: number | boolean }).featured ||
        0
    );
    const featuredB = Number(
      (b as BlogPost & { is_featured?: number | boolean; featured?: number | boolean })
        .is_featured ||
        (b as BlogPost & { featured?: number | boolean }).featured ||
        0
    );
    if (featuredA !== featuredB) return featuredB - featuredA;
    const dateA = Date.parse(a.created_at || "");
    const dateB = Date.parse(b.created_at || "");
    return (Number.isFinite(dateB) ? dateB : 0) - (Number.isFinite(dateA) ? dateA : 0);
  });
  const orderedBlocks: HomeLayoutBlock[] =
    (homeConfig.layoutBlocks as HomeLayoutBlock[])?.length
      ? (homeConfig.layoutBlocks as HomeLayoutBlock[])
      : ((homeConfig.sectionOrder as HomeSectionKey[]) || []).map((type, idx) => ({
          id: `${type}__fallback_${idx}`,
          type,
          instance: 1,
        }));

  const repeatableTypes: HomeSectionKey[] = ["flash_sale", "banner_section", "blog_section"];

  const resolveByInstance = <T,>(list: T[], instance?: number): T | null => {
    const index = Math.max(1, Number(instance || 1)) - 1;
    return list[index] ?? null;
  };

  const resolveBannerSpan = (block: HomeLayoutBlock): 4 | 6 | 12 => {
    const raw = Number(block.config?.banner_span);
    if (raw === 6) return 6;
    if (raw === 12) return 12;
    return 4;
  };

  const resolveFlashSaleSpan = (block: HomeLayoutBlock): 4 | 6 | 12 => {
    const raw = Number(block.config?.flash_sale_span);
    if (raw === 4) return 4;
    if (raw === 12) return 12;
    return 6;
  };

  const resolveBlogSpan = (block: HomeLayoutBlock): 4 | 6 | 12 => {
    const raw = Number(block.config?.blog_span);
    if (raw === 4) return 4;
    if (raw === 6) return 6;
    return 12;
  };

  const resolveTopStoresSpan = (block: HomeLayoutBlock): 4 | 6 | 12 => {
    const raw = Number(block.config?.top_stores_span);
    if (raw === 4) return 4;
    if (raw === 6) return 6;
    return 12;
  };

  const spanClassMap: Record<4 | 6 | 12, string> = {
    4: "md:col-span-4",
    6: "md:col-span-6",
    12: "md:col-span-12",
  };

  const BannerGridItem = ({ banner }: { banner: Banner }) => (
    <div
      className="group overflow-hidden rounded-2xl"
      style={{ backgroundColor: banner.background_color || "#F6F9FE" }}
    >
      <div className="flex min-h-[170px] items-center">
        <div className="flex flex-1 flex-col justify-center px-6 py-6 md:px-8">
          <h3
            className="mb-1 text-lg font-bold leading-tight md:text-xl"
            style={{ color: banner.title_color || "#1E293B" }}
          >
            {banner.title}
          </h3>
          {banner.description && (
            <p
              className="mb-4 line-clamp-2 text-xs md:text-sm"
              style={{ color: banner.description_color || "#475569" }}
            >
              {banner.description}
            </p>
          )}
          {banner.redirect_url && (
            <div>
              <Link
                href={banner.redirect_url}
                className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: banner.button_color || "#0E5ABC",
                  color: banner.button_text_color || "#FFFFFF",
                }}
              >
                {banner.button_text || "Shop Now"}
              </Link>
            </div>
          )}
        </div>
        <div className="relative hidden h-[150px] w-[180px] shrink-0 md:block">
          <Image
            src={banner.thumbnail_image || "/images/banner-illustration.png"}
            alt={banner.title}
            fill
            className="object-contain object-right-bottom"
            sizes="180px"
            unoptimized
          />
        </div>
      </div>
    </div>
  );

  const FlashSaleGridItem = ({ deal }: { deal: FlashDeal }) => (
    <div
      className="relative overflow-hidden rounded-[8px] p-4 min-h-[240px]"
      style={{ backgroundColor: deal.background_color || "#ffffff" }}
    >
      {deal.cover_image_url && (
        <div className="absolute inset-0">
          <Image
            src={deal.cover_image_url}
            alt={deal.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="relative z-[1] flex h-full items-center gap-3">
        {deal.image_url && (
          <div className="relative h-[180px] w-[140px] shrink-0">
            <Image
              src={deal.image_url}
              alt={deal.title}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3
            className="line-clamp-2 text-base font-semibold tracking-wide"
            style={{ color: deal.title_color || "#000000" }}
          >
            {deal.title}
          </h3>
          <CountdownTimer
            endTime={deal.end_time}
            bgColor={deal.timer_bg_color}
            textColor={deal.timer_text_color}
            labelColor={deal.title_color}
          />
          {deal.button_text && deal.button_url && (
            <Link href={deal.button_url}>
              <span
                className="inline-block rounded-[5px] px-3 py-2 text-sm font-semibold tracking-wide shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
                style={{
                  backgroundColor: deal.button_bg_color || "#1A73E8",
                  color: deal.button_text_color || "#ffffff",
                }}
              >
                {deal.button_text}
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  const BlogGridItem = ({ post }: { post: BlogPost }) => (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative h-[145px] w-full overflow-hidden bg-muted">
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : null}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{post.created_at}</p>
      </div>
    </Link>
  );

  const renderSingleSection = (block: HomeLayoutBlock) => {
    switch (block.type) {
      case "slider":
        return homeConfig.isSliderEnabled ? <HeroSlider sliders={data.sliders} /> : null;
      case "category":
        return homeConfig.isCategoriesEnabled && data.categories.length > 0 ? (
          <section>
            <SectionHeader
              title={homeConfig.categoriesTitle || t.categories_title}
              subtitle={homeConfig.categoriesSubtitle || t.categories_subtitle}
            />
            <CategorySection categories={data.categories} />
          </section>
        ) : null;
      case "flash_sale":
        return null;
      case "product_featured":
        return homeConfig.isFeaturedEnabled ? (
          <ProductSection
            title={homeConfig.featuredTitle || t.featured_title}
            subtitle={homeConfig.featuredSubtitle || t.featured_subtitle}
            products={data.featured}
          />
        ) : null;
      case "banner_section":
        return null;
      case "product_latest":
        return homeConfig.isLatestEnabled ? (
          <ProductSection
            title={homeConfig.latestTitle || t.new_arrivals_title}
            subtitle={homeConfig.latestSubtitle || t.new_arrivals_subtitle}
            products={data.newArrivals}
          />
        ) : null;
      case "product_top_selling":
        return homeConfig.isTopSellingEnabled ? (
          <ProductSection
            title={homeConfig.topSellingTitle || t.best_selling_title}
            subtitle={homeConfig.topSellingSubtitle || t.best_selling_subtitle}
            products={data.bestSelling}
          />
        ) : null;
      case "popular_product_section":
        return homeConfig.isPopularEnabled ? (
          <ProductSection
            title={homeConfig.popularTitle || t.popular_title}
            subtitle={homeConfig.popularSubtitle || t.popular_subtitle}
            products={data.popular}
          />
        ) : null;
      case "top_stores_section":
        return homeConfig.isTopStoresEnabled ? (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className={spanClassMap[resolveTopStoresSpan(block)]}>
              <TopStoresSection title={homeConfig.topStoresTitle || t.top_stores_title} />
            </div>
          </section>
        ) : null;
      case "blog_section":
        return null;
      case "newsletters_section":
        return homeConfig.isNewsletterEnabled ? (
          <NewsletterSection
            title={homeConfig.newsletterTitle || t.newsletter_title}
            subtitle={homeConfig.newsletterSubtitle || t.newsletter_subtitle}
          />
        ) : null;
      case "all_products_section":
        return homeConfig.isAllProductsEnabled ? (
          <InfiniteProductsSection
            title={homeConfig.allProductsTitle}
          />
        ) : null;
      default:
        return null;
    }
  };

  const renderRepeatableGroup = (
    type: "flash_sale" | "banner_section" | "blog_section",
    blocks: HomeLayoutBlock[],
    key: string
  ) => {
    const activeBlocks = blocks.filter((block) => block.enabled_disabled !== "off");
    if (!activeBlocks.length) return null;

    if (type === "flash_sale") {
      if (!homeConfig.isFlashSaleEnabled || orderedFlashDeals.length === 0) return null;
      const deals = activeBlocks
        .map((block) => {
          const deal = resolveByInstance(orderedFlashDeals, block.instance);
          if (!deal) return null;
          return {
            deal,
            span: resolveFlashSaleSpan(block),
            key: block.id || `flash_${block.instance || 1}`,
          };
        })
        .filter(
          (item): item is { deal: FlashDeal; span: 4 | 6 | 12; key: string } =>
            Boolean(item)
        );
      if (!deals.length) return null;

      return (
        <section key={key} className="space-y-4">
          <SectionHeader
            title={homeConfig.flashSaleTitle || t.top_deals_title}
            subtitle={homeConfig.flashSaleSubtitle || t.top_deals_subtitle}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {deals.map((item) => (
              <div key={`flash_${item.key}_${item.deal.id}`} className={spanClassMap[item.span]}>
                <FlashSaleGridItem deal={item.deal} />
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (type === "blog_section") {
      if (!homeConfig.isBlogEnabled || orderedBlogs.length === 0) return null;
      const blogItems = activeBlocks
        .map((block) => {
          const blog = resolveByInstance(orderedBlogs, block.instance);
          if (!blog) return null;
          return {
            blog,
            span: resolveBlogSpan(block),
            key: block.id || `blog_${block.instance || 1}`,
          };
        })
        .filter(
          (item): item is { blog: BlogPost; span: 4 | 6 | 12; key: string } => Boolean(item)
        );
      if (!blogItems.length) return null;

      return (
        <section key={key} className="space-y-4">
          <SectionHeader
            title={homeConfig.blogTitle || t.blog_title}
            subtitle={homeConfig.blogSubtitle || t.blog_subtitle}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {blogItems.map((item) => (
              <div key={`blog_${item.key}_${item.blog.id}`} className={spanClassMap[item.span]}>
                <BlogGridItem post={item.blog} />
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (!homeConfig.isBannerEnabled) return null;
    const bannerItems = activeBlocks
      .map((block) => {
        const banner = resolveByInstance(banners, block.instance);
        if (!banner) return null;
        return {
          banner,
          span: resolveBannerSpan(block),
          key: block.id || `banner_${block.instance || 1}`,
        };
      })
      .filter(
        (item): item is { banner: Banner; span: 4 | 6 | 12; key: string } =>
          Boolean(item)
      );

    if (isBannerLoading && bannerItems.length === 0) {
      return (
        <section key={key}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {activeBlocks.map((block, idx) => (
              <div
                key={`banner_skeleton_${block.id || idx}`}
                className={`h-[170px] animate-pulse rounded-2xl bg-muted ${spanClassMap[resolveBannerSpan(block)]}`}
              />
            ))}
          </div>
        </section>
      );
    }

    if (!bannerItems.length) return null;

    return (
      <section key={key}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {bannerItems.map((item) => (
            <div key={`banner_${item.key}_${item.banner.id}`} className={spanClassMap[item.span]}>
              <BannerGridItem banner={item.banner} />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderedBlocks: ReactNode[] = [];
  for (let i = 0; i < orderedBlocks.length; i += 1) {
    const current = orderedBlocks[i];
    if (current?.enabled_disabled === "off") {
      continue;
    }
    if (current && repeatableTypes.includes(current.type)) {
      const group: HomeLayoutBlock[] = [current];
      while (
        i + 1 < orderedBlocks.length &&
        orderedBlocks[i + 1] &&
        orderedBlocks[i + 1].type === current.type
      ) {
        group.push(orderedBlocks[i + 1]);
        i += 1;
      }
      renderedBlocks.push(
        renderRepeatableGroup(
          current.type as "flash_sale" | "banner_section" | "blog_section",
          group,
          `${current.type}_${group[0]?.id || i}`
        )
      );
      continue;
    }
    renderedBlocks.push(
      <Fragment key={current.id || `${current.type}_${current.instance || 1}_${i}`}>
        {renderSingleSection(current)}
      </Fragment>
    );
  }

  return (
    <div className="container space-y-10 py-6">
      <h1 className="sr-only">Sportoonline — Online Alışveriş</h1>
      {renderedBlocks}
    </div>
  );
}
