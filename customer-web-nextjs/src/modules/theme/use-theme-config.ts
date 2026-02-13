"use client";

import { useLocale } from "next-intl";
import { useThemeQuery } from "./theme.service";

export function useThemeConfig() {
  const locale = useLocale();
  const { data: themeResponse, isLoading, error } = useThemeQuery();
  const themeData = themeResponse?.theme_data;

  // Helper: İlk array elemanını al
  function firstOrNull<T>(arr: T[] | undefined): T | null {
    return arr && arr.length > 0 ? arr[0] : null;
  }

  // Locale-aware theme_pages: If translation exists for current locale, use it
  // API returns: { theme_data: { theme_pages: [...TR...] }, translations: { en: { theme_data: { theme_pages: [...EN...] } } } }
  const defaultPages = firstOrNull(themeData?.theme_pages);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translatedThemeData = (themeResponse?.translations as any)?.[locale]?.theme_data;
  const translatedPages = translatedThemeData ? firstOrNull(translatedThemeData.theme_pages) : null;

  // Use translated pages if available, otherwise fall back to default (Turkish)
  const pages = translatedPages || defaultPages;

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
    sliderNumber: (firstOrNull(homePage?.slider) as any)?.slider_number || "1",
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
    // Light mode
    row1Bg: headerData?.row1_bg,
    row1Text: headerData?.row1_text,
    row2Bg: headerData?.row2_bg,
    row3Bg: headerData?.row3_bg,
    row3Text: headerData?.row3_text,
    row3ButtonBg: headerData?.row3_button_bg,
    row3ButtonText: headerData?.row3_button_text,
    // Dark mode
    darkRow1Bg: headerData?.dark_row1_bg,
    darkRow1Text: headerData?.dark_row1_text,
    darkRow2Bg: headerData?.dark_row2_bg,
    darkRow3Bg: headerData?.dark_row3_bg,
    darkRow3Text: headerData?.dark_row3_text,
    darkRow3ButtonBg: headerData?.dark_row3_button_bg,
    darkRow3ButtonText: headerData?.dark_row3_button_text,
  };

  // Footer
  const footerConfig = {
    backgroundColor: footerData?.background_color,
    textColor: footerData?.text_color,
    darkBackgroundColor: footerData?.dark_background_color,
    darkTextColor: footerData?.dark_text_color,
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
