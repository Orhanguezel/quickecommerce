"use client";

import { Link } from "@/i18n/routing";
import { useSiteInfoQuery, useFooterQuery } from "@/modules/site/site.action";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import { useTranslations } from "next-intl";
import type { FooterLinkItem } from "@/modules/site/site.type";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Banknote,
} from "lucide-react";
import { usePaymentGatewaysQuery } from "@/modules/checkout/checkout.service";

export function Footer() {
  const t = useTranslations();
  const { siteInfo } = useSiteInfoQuery();
  const { footerData } = useFooterQuery();
  const { footerConfig } = useThemeConfig();
  const { data: paymentGateways } = usePaymentGatewaysQuery();

  const quickAccess: FooterLinkItem[] = footerData?.com_quick_access ?? [];
  const ourInfo: FooterLinkItem[] = footerData?.com_our_info ?? [];
  const helpCenter: FooterLinkItem[] = footerData?.com_help_center ?? [];

  // Dynamic grid columns based on theme config
  // Dynamic grid columns based on theme config
  const colCount = Number(footerConfig.layoutColumns);
  const gridMap: Record<number, string> = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };
  const gridColsClass = gridMap[colCount] || "lg:grid-cols-4";

  const showQuickAccess =
    footerData?.com_quick_access_enable_disable === "on" &&
    quickAccess.length > 0;
  const showOurInfo =
    footerData?.com_our_info_enable_disable === "on" && ourInfo.length > 0;
  const showSocial = footerData?.com_social_links_enable_disable === "on";
  const showPayment = footerData?.com_payment_methods_enable_disable === "on";

  const hasSocialLink =
    footerData?.com_social_links_facebook_url ||
    footerData?.com_social_links_twitter_url ||
    footerData?.com_social_links_instagram_url ||
    footerData?.com_social_links_linkedin_url;

  // Backend already filters status=1; show all active gateways, fallback icon for those without images
  const activePaymentGateways = paymentGateways ?? [];

  const hasDownloadApp =
    footerData?.com_download_app_link_one ||
    footerData?.com_download_app_link_two;

  const getLinkTitle = (item: FooterLinkItem) =>
    item.com_quick_access_title || item.title || "";
  const getLinkUrl = (item: FooterLinkItem) =>
    item.com_quick_access_url || item.url || "/";

  return (
    <footer
      style={{
        backgroundColor: 'hsl(var(--footer-background))',
        color: 'hsl(var(--footer-foreground))',
      }}
    >
      <div className="container py-10">
        {/* Main Grid */}
        <div className={`grid grid-cols-1 gap-8 md:grid-cols-2 ${gridColsClass}`}>
          {/* Brand & Contact */}
          <div>
            {(siteInfo?.com_site_white_logo || siteInfo?.com_site_logo) ? (
              <img
                src={siteInfo.com_site_white_logo || siteInfo.com_site_logo}
                alt={siteInfo?.com_site_title || "Logo"}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <h3 className="text-xl font-bold">
                {siteInfo?.com_site_title || "Sportoonline"}
              </h3>
            )}
            {siteInfo?.com_site_subtitle && (
              <p className="mt-3 text-sm text-gray-400">
                {siteInfo.com_site_subtitle}
              </p>
            )}

            {/* Contact Info */}
            <div className="mt-5 space-y-3">
              {siteInfo?.com_site_full_address && (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">
                      {t("footer.address")}:
                    </span>
                    <p className="text-sm text-gray-300">
                      {siteInfo.com_site_full_address}
                    </p>
                  </div>
                </div>
              )}
              {siteInfo?.com_site_email && (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                    <Mail className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">
                      {t("footer.email")}:
                    </span>
                    <p className="text-sm text-gray-300">
                      <a
                        href={`mailto:${siteInfo.com_site_email}`}
                        className="hover:text-white"
                      >
                        {siteInfo.com_site_email}
                      </a>
                    </p>
                  </div>
                </div>
              )}
              {siteInfo?.com_site_contact_number && (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <Phone className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">
                      {t("footer.phone")}:
                    </span>
                    <p className="text-sm text-gray-300">
                      <a
                        href={`tel:${siteInfo.com_site_contact_number}`}
                        className="hover:text-white"
                      >
                        {siteInfo.com_site_contact_number}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Access */}
          {showQuickAccess && (
            <div>
              <h4 className="mb-4 text-base font-bold">
                {t("footer.quick_access")}
              </h4>
              <ul className="space-y-2.5">
                {quickAccess.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={getLinkUrl(item)}
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {getLinkTitle(item)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Our Information */}
          {showOurInfo && (
            <div>
              <h4 className="mb-4 text-base font-bold">
                {t("footer.our_information")}
              </h4>
              <ul className="space-y-2.5">
                {ourInfo.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={getLinkUrl(item)}
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {getLinkTitle(item)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Help Center */}
          {helpCenter.length > 0 && (
            <div>
              <h4 className="mb-4 text-base font-bold">
                {t("footer.help_center")}
              </h4>
              <ul className="space-y-2.5">
                {helpCenter.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={getLinkUrl(item)}
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {getLinkTitle(item)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-800" />

        {/* Bottom Row: Social | Payment | Download App */}
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Social Links */}
          {showSocial && hasSocialLink ? (
            <div>
              {footerData?.com_social_links_title === "on" && (
                <h4 className="mb-3 text-sm font-bold">
                  {t("footer.social_connect")}
                </h4>
              )}
              <div className="flex items-center gap-3">
                {footerData?.com_social_links_facebook_url && (
                  <a
                    href={footerData.com_social_links_facebook_url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 transition-colors hover:bg-blue-700"
                  >
                    <Facebook className="h-4 w-4 text-white" />
                  </a>
                )}
                {footerData?.com_social_links_twitter_url && (
                  <a
                    href={footerData.com_social_links_twitter_url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 transition-colors hover:bg-sky-600"
                  >
                    <Twitter className="h-4 w-4 text-white" />
                  </a>
                )}
                {footerData?.com_social_links_instagram_url && (
                  <a
                    href={footerData.com_social_links_instagram_url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 transition-opacity hover:opacity-90"
                  >
                    <Instagram className="h-4 w-4 text-white" />
                  </a>
                )}
                {footerData?.com_social_links_linkedin_url && (
                  <a
                    href={footerData.com_social_links_linkedin_url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 transition-colors hover:bg-blue-800"
                  >
                    <Linkedin className="h-4 w-4 text-white" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* Payment Methods */}
          {showPayment && activePaymentGateways.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {activePaymentGateways.map((gw) => (
                <div
                  key={gw.id}
                  className="flex h-8 items-center rounded bg-white px-2 gap-1.5"
                  title={gw.name}
                >
                  {gw.image_url ? (
                    <img
                      src={gw.image_url}
                      alt={gw.name}
                      className="h-5 w-auto max-w-[60px] object-contain"
                    />
                  ) : (
                    <>
                      {gw.slug === "cash_on_delivery" ? (
                        <Banknote className="h-4 w-4 text-gray-600 shrink-0" />
                      ) : (
                        <CreditCard className="h-4 w-4 text-gray-600 shrink-0" />
                      )}
                      <span className="text-xs font-medium text-gray-700 leading-tight max-w-[56px] truncate">
                        {gw.name}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* Download App */}
          {hasDownloadApp ? (
            <div className="lg:text-right">
              <h4 className="mb-3 text-sm font-bold">
                {t("footer.download_app")}
              </h4>
              <div className="flex gap-3 lg:justify-end">
                {footerData?.com_download_app_link_two && (
                  <a
                    href={footerData.com_download_app_link_two}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-black px-4 py-2 transition-colors hover:bg-gray-900"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-current"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <div className="text-left">
                      <div className="text-[11px] text-gray-400">
                        Download on the
                      </div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </a>
                )}
                {footerData?.com_download_app_link_one && (
                  <a
                    href={footerData.com_download_app_link_one}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-black px-4 py-2 transition-colors hover:bg-gray-900"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-current"
                    >
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z" />
                    </svg>
                    <div className="text-left">
                      <div className="text-[11px] text-gray-400">
                        GET IT ON
                      </div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          {siteInfo?.com_site_footer_copyright || (
            <span>
              &copy; {new Date().getFullYear()} Sportoonline. All rights
              reserved.
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
