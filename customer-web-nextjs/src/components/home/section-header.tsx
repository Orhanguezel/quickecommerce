"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  onPrev?: () => void;
  onNext?: () => void;
}

export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  onPrev,
  onNext,
}: SectionHeaderProps) {
  const t = useTranslations("common");

  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-semibold tracking-tight truncate">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        {(onPrev || onNext) && (
          <div className="flex items-center gap-1.5 mr-2">
            <button
              onClick={onPrev}
              aria-label="Geri"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-background text-foreground transition-all hover:bg-primary hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNext}
              aria-label="İleri"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-background text-foreground transition-all hover:bg-primary hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {viewAllHref && (
          <Link
            href={viewAllHref}
            title={`${t("view_all")} — ${title}`}
            className="flex items-center gap-1.5 rounded-full border border-primary/30 px-4 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary/5"
          >
            {t("view_all")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
