"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

export default function WhatsappTabs() {
  const locale = useLocale();
  const pathname = usePathname().replace(/\/$/, "");
  const base = `/${locale}/admin/system-management/whatsapp`;
  return <nav aria-label="WhatsApp bölümleri" className="flex gap-1 border-b">
    {[[base, "Yönetim"], [`${base}/rehber`, "Kullanım Rehberi"]].map(([href, label]) => {
      const active = pathname === href;
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}
        className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${active ? "border-blue-600 text-blue-700 dark:text-blue-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
        {label}
      </Link>;
    })}
  </nav>;
}
