"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { ChevronRight, Ticket, Copy, Check } from "lucide-react";

interface Coupon {
  id: number;
  coupon_title: string;
  coupon_description: string | null;
  coupon_image_url: string | null;
  coupon_code: string;
  discount_type: string;
  discount: number;
  min_order_value: number;
  max_discount: number;
  start_date: string;
  end_date: string;
}

interface CouponTranslations {
  coupons: string;
  coupons_subtitle: string;
  code: string;
  copy: string;
  copied: string;
  min_order: string;
  max_discount: string;
  valid_until: string;
  off: string;
  no_coupons: string;
  previous: string;
  next: string;
  home: string;
  currency: string;
}

interface CouponsPageClientProps {
  coupons: Coupon[];
  totalPages: number;
  currentPage: number;
  translations: CouponTranslations;
}

export function CouponsPageClient({
  coupons,
  totalPages,
  currentPage,
  translations: t,
}: CouponsPageClientProps) {
  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return `/kuponlar${query ? `?${query}` : ""}`;
  }

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">{t.home}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t.coupons}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.coupons}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.coupons_subtitle}</p>
      </div>

      {coupons.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} translations={t} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Ticket className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">{t.no_coupons}</p>
        </div>
      )}

      {/* Pagination */}
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
                  page === currentPage ? "bg-primary text-primary-foreground" : "hover:bg-muted"
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

function CouponCard({ coupon, translations: t }: { coupon: Coupon; translations: CouponTranslations }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(coupon.coupon_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const endDate = new Date(coupon.end_date);
  const formattedDate = endDate.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Discount Badge */}
      <div className="bg-primary/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            {coupon.discount_type === "percentage"
              ? `%${coupon.discount}`
              : `${coupon.discount}${t.currency}`}
          </span>
          <span className="text-sm font-medium text-primary">{t.off}</span>
        </div>
        <h3 className="mt-1 font-semibold">{coupon.coupon_title}</h3>
        {coupon.coupon_description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {coupon.coupon_description}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 p-4 text-sm">
        {/* Code */}
        <div className="flex items-center justify-between rounded border border-dashed px-3 py-2">
          <code className="font-mono font-semibold tracking-wider">
            {coupon.coupon_code}
          </code>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t.copied : t.copy}
          </button>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t.min_order}: {coupon.min_order_value}{t.currency}</span>
          {coupon.max_discount > 0 && (
            <span>{t.max_discount}: {coupon.max_discount}{t.currency}</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {t.valid_until}: {formattedDate}
        </div>
      </div>
    </div>
  );
}
