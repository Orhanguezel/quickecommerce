"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
}

export function SectionHeader({ title, subtitle, viewAllHref }: SectionHeaderProps) {
  const t = useTranslations("common");

  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1.5 rounded-full border border-primary/30 px-4 py-1.5 text-[13px] font-normal text-primary transition-colors hover:bg-primary/5"
        >
          {t("view_all")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
