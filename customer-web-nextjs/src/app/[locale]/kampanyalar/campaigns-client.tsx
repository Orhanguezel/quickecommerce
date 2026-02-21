"use client";

import { Link } from "@/i18n/routing";
import { ChevronRight, Megaphone } from "lucide-react";
import type { FlashDeal } from "@/modules/flash-deal/flash-deal.type";
import { CountdownTimer } from "@/components/home/countdown-timer";

interface CampaignsTranslations {
  home: string;
  previous: string;
  next: string;
  title: string;
  subtitle: string;
  no_campaigns: string;
}

interface CampaignsPageClientProps {
  campaigns: FlashDeal[];
  currentPage: number;
  totalPages: number;
  translations: CampaignsTranslations;
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function CampaignAction({
  href,
  text,
  backgroundColor,
  textColor,
}: {
  href: string;
  text: string;
  backgroundColor?: string;
  textColor?: string;
}) {
  const className =
    "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90";
  const style = {
    backgroundColor: backgroundColor || "#1A73E8",
    color: textColor || "#FFFFFF",
  };

  if (isExternalUrl(href)) {
    return (
      <a href={href} className={className} style={style}>
        {text}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style}>
      {text}
    </Link>
  );
}

function CampaignCard({ campaign }: { campaign: FlashDeal }) {
  return (
    <div
      className="group overflow-hidden rounded-2xl border border-border/60"
      style={{ backgroundColor: campaign.background_color || "#F6F9FE" }}
    >
      <div className="relative p-5">
        {campaign.cover_image_url && (
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `url(${campaign.cover_image_url})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
        )}

        <div className="relative z-10 flex min-h-[230px] flex-col justify-between">
          <div>
            <h2
              className="text-xl font-bold leading-tight"
              style={{ color: campaign.title_color || "#111827" }}
            >
              {campaign.title}
            </h2>
            {campaign.description && (
              <p
                className="mt-2 line-clamp-3 text-sm"
                style={{ color: campaign.description_color || "#4B5563" }}
              >
                {campaign.description}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <CountdownTimer
              endTime={campaign.end_time}
              bgColor={campaign.timer_bg_color}
              textColor={campaign.timer_text_color}
              labelColor={campaign.title_color}
            />

            {campaign.button_text && campaign.button_url && (
              <CampaignAction
                href={campaign.button_url}
                text={campaign.button_text}
                backgroundColor={campaign.button_bg_color}
                textColor={campaign.button_text_color}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CampaignsPageClient({
  campaigns,
  currentPage,
  totalPages,
  translations: t,
}: CampaignsPageClientProps) {
  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return `/kampanyalar${query ? `?${query}` : ""}`;
  }

  return (
    <div className="container py-8">
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-primary">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{t.title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {campaigns.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border bg-card text-center">
          <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="text-muted-foreground">{t.no_campaigns}</p>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              {t.previous}
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            let page: number;
            if (totalPages <= 7) page = i + 1;
            else if (currentPage <= 4) page = i + 1;
            else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
            else page = currentPage - 3 + i;

            return (
              <Link
                key={page}
                href={buildPageUrl(page)}
                className={`rounded-md border px-3 py-2 text-sm ${
                  page === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {page}
              </Link>
            );
          })}
          {currentPage < totalPages && (
            <Link
              href={buildPageUrl(currentPage + 1)}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              {t.next}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
