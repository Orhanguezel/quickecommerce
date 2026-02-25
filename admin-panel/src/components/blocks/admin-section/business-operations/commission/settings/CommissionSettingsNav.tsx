"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    labelKey: "common.commission_subscription_settings",
    href: "/admin/business-operations/commission/settings",
  },
  {
    labelKey: "common.shipping_settings",
    href: "/admin/business-operations/commission/shipping",
  },
  {
    labelKey: "common.tax_settings",
    href: "/admin/business-operations/commission/tax",
  },
];

const CommissionSettingsNav = () => {
  const t = useTranslations();
  const pathname = usePathname();

  // Strip locale prefix for matching (e.g. /tr/admin/... → /admin/...)
  const normalizedPath = pathname.replace(/^\/[a-z]{2}\//, "/");

  return (
    <div className="flex flex-wrap gap-2 border-b pb-3 mb-4">
      {TABS.map((tab) => {
        const isActive = normalizedPath === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {t(tab.labelKey as any)}
          </Link>
        );
      })}
    </div>
  );
};

export default CommissionSettingsNav;
