"use client";

import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { useSiteInfoQuery } from "@/modules/site/site.action";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();
  const { siteInfo } = useSiteInfoQuery();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold">
              {siteInfo?.com_site_title || "Sporto Online"}
            </h3>
            {siteInfo?.com_site_subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">
                {siteInfo.com_site_subtitle}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">
              {t("nav.categories")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={ROUTES.STORES}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("nav.stores")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.BLOG}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("nav.blog")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.COUPONS}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("nav.coupons")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">
              {t("footer.about_us")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={ROUTES.ABOUT}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.CONTACT}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.TERMS}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.PRIVACY}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">
              {t("footer.contact_us")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {siteInfo?.com_site_email && (
                <li>
                  <a href={`mailto:${siteInfo.com_site_email}`} className="hover:text-foreground">
                    {siteInfo.com_site_email}
                  </a>
                </li>
              )}
              {siteInfo?.com_site_contact_number && (
                <li>
                  <a href={`tel:${siteInfo.com_site_contact_number}`} className="hover:text-foreground">
                    {siteInfo.com_site_contact_number}
                  </a>
                </li>
              )}
              {siteInfo?.com_site_full_address && (
                <li>{siteInfo.com_site_full_address}</li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          {siteInfo?.com_site_footer_copyright || (
            <span>&copy; {new Date().getFullYear()} Sporto Online. All rights reserved.</span>
          )}
        </div>
      </div>
    </footer>
  );
}
