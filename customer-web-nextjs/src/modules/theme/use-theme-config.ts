"use client";

import { useThemeQuery } from "./theme.service";

export function useThemeConfig() {
  const { data: themeResponse, isLoading, error } = useThemeQuery();
  const themeData = themeResponse?.theme_data;

  // Helper: İlk array elemanını al
  function firstOrNull<T>(arr: T[] | undefined): T | null {
    return arr && arr.length > 0 ? arr[0] : null;
  }

  const pages = firstOrNull(themeData?.theme_pages);
  const homePage = firstOrNull(pages?.theme_home_page);
  const loginPage = firstOrNull(pages?.theme_login_page);
  const registerPage = firstOrNull(pages?.theme_register_page);
  const productDetailsPage = firstOrNull(pages?.theme_product_details_page);
  const blogPage = firstOrNull(pages?.theme_blog_page);
  const headerData = firstOrNull(themeData?.theme_header);
  const footerData = firstOrNull(themeData?.theme_footer);

  // Helper: Theme verisi yoksa varsayılan olarak göster
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isOn = (section: any[] | undefined) =>
    !homePage ? true : (section && section.length > 0 ? (section[0] as any)?.enabled_disabled === "on" : false);

  // Ana Sayfa Accessor'ları
  const homeConfig = {
    isSliderEnabled: isOn(homePage?.slider),
    isCategoriesEnabled: isOn(homePage?.category),
    categoriesTitle: firstOrNull(homePage?.category)?.title,
    categoriesSubtitle: firstOrNull(homePage?.category)?.subtitle,
    isFlashSaleEnabled: isOn(homePage?.flash_sale),
    flashSaleTitle: firstOrNull(homePage?.flash_sale)?.title,
    flashSaleSubtitle: firstOrNull(homePage?.flash_sale)?.subtitle,
    isFeaturedEnabled: isOn(homePage?.product_featured),
    featuredTitle: firstOrNull(homePage?.product_featured)?.title,
    featuredSubtitle: firstOrNull(homePage?.product_featured)?.subtitle,
    isBannerEnabled: isOn(homePage?.banner_section),
    isTopSellingEnabled: isOn(homePage?.product_top_selling),
    topSellingTitle: firstOrNull(homePage?.product_top_selling)?.title,
    topSellingSubtitle: firstOrNull(homePage?.product_top_selling)?.subtitle,
    isLatestEnabled: isOn(homePage?.product_latest),
    latestTitle: firstOrNull(homePage?.product_latest)?.title,
    latestSubtitle: firstOrNull(homePage?.product_latest)?.subtitle,
    isPopularEnabled: isOn(homePage?.popular_product_section),
    popularTitle: firstOrNull(homePage?.popular_product_section)?.title,
    popularSubtitle: firstOrNull(homePage?.popular_product_section)?.subtitle,
    isTopStoresEnabled: isOn(homePage?.top_stores_section),
    topStoresTitle: firstOrNull(homePage?.top_stores_section)?.title,
    isNewsletterEnabled: isOn(homePage?.newsletters_section),
    newsletterTitle: firstOrNull(homePage?.newsletters_section)?.title,
    newsletterSubtitle: firstOrNull(homePage?.newsletters_section)?.subtitle,
  };

  // Giriş Sayfası
  const loginConfig = {
    isEnabled: firstOrNull(loginPage?.customer)?.enabled_disabled === "on",
    title: firstOrNull(loginPage?.customer)?.title,
    subtitle: firstOrNull(loginPage?.customer)?.subtitle,
    imageUrl: firstOrNull(loginPage?.customer)?.img_url,
  };

  // Kayıt Sayfası
  const registerConfig = {
    title: registerPage?.title,
    subtitle: registerPage?.subtitle,
    description: registerPage?.description,
    termsPageTitle: registerPage?.terms_page_title,
    termsPageUrl: registerPage?.terms_page_url,
    isSocialLoginEnabled: registerPage?.social_login_enable_disable === "on",
    imageUrl: registerPage?.img_url,
  };

  // Ürün Detay
  const productDetailsConfig = {
    isDeliveryEnabled: productDetailsPage?.delivery_enabled_disabled === "on",
    deliveryTitle: productDetailsPage?.delivery_title,
    deliverySubtitle: productDetailsPage?.delivery_subtitle,
    deliveryUrl: productDetailsPage?.delivery_url,
    isRefundEnabled: productDetailsPage?.refund_enabled_disabled === "on",
    refundTitle: productDetailsPage?.refund_title,
    refundSubtitle: productDetailsPage?.refund_subtitle,
    refundUrl: productDetailsPage?.refund_url,
    relatedTitle: productDetailsPage?.related_title,
  };

  // Blog
  const blogConfig = {
    popularTitle: blogPage?.popular_title,
    relatedTitle: blogPage?.related_title,
  };

  // Header
  const headerConfig = {
    headerNumber: headerData?.header_number || "1",
  };

  // Footer
  const footerConfig = {
    backgroundColor: footerData?.background_color,
    textColor: footerData?.text_color,
    layoutColumns: footerData?.layout_columns || 4,
  };

  return {
    themeData,
    isLoading,
    error,
    homeConfig,
    loginConfig,
    registerConfig,
    productDetailsConfig,
    blogConfig,
    headerConfig,
    footerConfig,
  };
}
