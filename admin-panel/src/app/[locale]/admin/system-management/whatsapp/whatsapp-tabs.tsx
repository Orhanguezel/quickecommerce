"use client";

import { BookOpen, FileText, MessagesSquare, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "", label: "Mesajlar", icon: MessagesSquare },
  { path: "/sablonlar", label: "Şablonlar", icon: FileText },
  { path: "/ayarlar", label: "Ayarlar", icon: Settings2 },
  { path: "/rehber", label: "Kullanım Rehberi", icon: BookOpen },
];

export default function WhatsappTabs() {
  const locale = useLocale();
  const pathname = usePathname().replace(/\/$/, "");
  const base = `/${locale}/admin/system-management/whatsapp`;

  return (
    <nav aria-label="WhatsApp bölümleri" className="flex flex-wrap gap-x-1 gap-y-1 border-t px-3 pt-2 sm:px-5">
      {tabs.map(({ path, label, icon: Icon }) => {
        const href = base + path;
        const active = pathname === href;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-t-md border-b-2 px-2.5 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 sm:px-3",
              active ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
            <Icon aria-hidden className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
