"use client";

import { Star } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useLoyaltyCampaignQuery } from "@/modules/loyalty/loyalty.service";

/**
 * "Degerlendir" giris noktasi.
 *
 * NEDEN VAR: degerlendirme dialogu yalnizca urun sayfasindaki
 * `?review=<orderId>` parametresiyle aciliyordu -- yani tek giris yolu
 * teslimattan sonra giden e-postaydi. Uygulama icinden yorum yazmanin hicbir
 * yolu yoktu. Kampanyayi duyurmadan once yolu acmak gerekiyor; aksi halde
 * "yorum yaz puan kazan" diyen bir banner, tiklanacak yeri olmayan bir vaat
 * olur.
 *
 * KAMPANYADAN BAGIMSIZ CALISIR: puan kapaliyken buton yine gorunur, sadece
 * "X TL kazan" ibaresi dusulur. Degerlendirme yazabilmek kampanyaya bagli
 * olmamali.
 */

interface OrderLikeDetail {
  product_id: number;
  product_slug?: string | null;
  product_name: string;
  review_status?: boolean;
}

/** Henuz degerlendirilmemis, slug'i olan ilk urun. */
function firstReviewable(details?: OrderLikeDetail[] | null) {
  return (details ?? []).find((d) => !d.review_status && d.product_slug) ?? null;
}

function useBonusLabel() {
  const { data } = useLoyaltyCampaignQuery();
  const campaign = data?.data;

  if (!campaign?.active) return null;

  // Fotografli degerlendirme ustteki tutari kazandirir; tesvik en yuksek
  // rakamla anlatilir, kosullar sayfasi ayrimi zaten yaziyor.
  return `${campaign.review_bonus_with_image_value} TL kazan`;
}

/**
 * Siparis listesi icin tek buton: o siparisteki ilk degerlendirilmemis urune
 * goturur. Teslim edilmemis ya da hepsi degerlendirilmis sipariste hic
 * gorunmez.
 */
export function OrderReviewCta({
  status,
  orderId,
  details,
  className = "",
}: {
  status: string;
  orderId: number;
  details?: OrderLikeDetail[] | null;
  className?: string;
}) {
  const bonus = useBonusLabel();
  const target = firstReviewable(details);

  if (status !== "delivered" || !target) return null;

  return (
    <Button variant="outline" size="sm" asChild className={className}>
      <Link href={`/urun/${target.product_slug}?review=${orderId}`}>
        <Star className="mr-1.5 h-3.5 w-3.5" />
        {bonus ? `Değerlendir · ${bonus}` : "Değerlendir"}
      </Link>
    </Button>
  );
}

/**
 * Siparis detayinda urun satiri basina buton. Degerlendirilmis urunde
 * butonun yerine sade bir "Değerlendirildi" ibaresi kalir ki musteri neyi
 * yaptigini gorsun.
 */
export function ProductReviewCta({
  status,
  orderId,
  detail,
  className = "",
}: {
  status: string;
  orderId: number;
  detail: OrderLikeDetail;
  className?: string;
}) {
  const bonus = useBonusLabel();

  if (status !== "delivered") return null;

  if (detail.review_status) {
    return (
      <span className={`text-xs text-muted-foreground ${className}`}>
        ✓ Değerlendirildi
      </span>
    );
  }

  if (!detail.product_slug) return null;

  return (
    <Button variant="outline" size="sm" asChild className={className}>
      <Link href={`/urun/${detail.product_slug}?review=${orderId}`}>
        <Star className="mr-1.5 h-3.5 w-3.5" />
        {bonus ? `Değerlendir · ${bonus}` : "Değerlendir"}
      </Link>
    </Button>
  );
}
