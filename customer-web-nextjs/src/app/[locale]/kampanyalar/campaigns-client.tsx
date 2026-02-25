"use client";

import { Link } from "@/i18n/routing";
import { ChevronRight, Megaphone } from "lucide-react";
import type { FlashDeal } from "@/modules/flash-deal/flash-deal.type";
import type { ShippingCampaign } from "@/modules/shipping-campaign/shipping-campaign.type";
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
  shippingCampaigns?: ShippingCampaign[];
  currentPage: number;
  totalPages: number;
  translations: CampaignsTranslations;
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function getDiscountLabel(campaign: FlashDeal): string {
  const amount = Number(campaign.discount_amount ?? 0);
  if (!amount) return "";

  if (campaign.discount_type === "percentage") {
    return `%${Math.round(amount)} INDIRIM`;
  }

  const fixed = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${fixed} TL INDIRIM`;
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

function ShippingCampaignCard({ campaign }: { campaign: ShippingCampaign }) {
  const minOrderFormatted = Number.isInteger(campaign.min_order_value)
    ? String(campaign.min_order_value)
    : campaign.min_order_value.toFixed(0);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border/60"
      style={{ backgroundColor: campaign.background_color || "#1B4B8B" }}
    >
      {/* Free shipping badge — same style as flash deal discount badge */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <div className="rounded-2xl bg-[radial-gradient(circle_at_30%_20%,#bfdbfe_0%,#2563eb_38%,#1e3a8a_100%)] px-7 py-4 text-center text-xl font-black tracking-[0.08em] text-white shadow-[0_16px_36px_rgba(30,58,138,0.45)] ring-2 ring-white/90 backdrop-blur-[1px] animate-pulse">
          KARGO BEDAVA!
        </div>
      </div>

      <div className="relative p-5">
        {campaign.image_url && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${campaign.image_url})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
        )}

        <div className="relative z-10 flex min-h-[230px] flex-col justify-between">
          <div>
            <h2
              className="text-xl font-bold leading-tight"
              style={{ color: campaign.title_color || "#FFFFFF" }}
            >
              {campaign.title}
            </h2>
            {campaign.description && (
              <p
                className="mt-2 line-clamp-3 text-sm"
                style={{ color: campaign.description_color || "#E8F0FE" }}
              >
                {campaign.description}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
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

function CampaignCard({ campaign }: { campaign: FlashDeal }) {
  const discountLabel = getDiscountLabel(campaign);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border/60"
      style={{ backgroundColor: campaign.background_color || "#F6F9FE" }}
    >
      {discountLabel && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-2xl bg-[radial-gradient(circle_at_30%_20%,#fff7b1_0%,#f59e0b_38%,#dc2626_100%)] px-7 py-4 text-center text-xl font-black tracking-[0.08em] text-white shadow-[0_16px_36px_rgba(220,38,38,0.45)] ring-2 ring-white/90 backdrop-blur-[1px] animate-pulse">
            {discountLabel}
          </div>
        </div>
      )}
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
  shippingCampaigns = [],
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

  const hasAnyCampaign = shippingCampaigns.length > 0 || campaigns.length > 0;

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

      {hasAnyCampaign ? (
        <div className="grid gap-5 md:grid-cols-2">
          {/* Shipping campaigns first */}
          {shippingCampaigns.map((campaign) => (
            <ShippingCampaignCard key={`shipping-${campaign.id}`} campaign={campaign} />
          ))}
          {/* Flash deal campaigns */}
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
