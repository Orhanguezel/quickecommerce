"use client";

import { Camera, Gift } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLoyaltyCampaignQuery } from "@/modules/loyalty/loyalty.service";

interface Props {
  /**
   * "full"    — kampanya duyurusu (siparislerim / hesabim ustu)
   * "compact" — yorum yazma ekraninda tek satirlik hatirlatma
   */
  variant?: "full" | "compact";
  className?: string;
}

/**
 * Degerlendirme kampanyasi duyurusu.
 *
 * Popup DEGIL banner: acilir pencere donusumu dusurur ve tesvik en cok
 * degerlendirme eyleminin oldugu yerde ise yarar.
 *
 * Kampanya kapaliyken (com_loyalty_enabled = off) hicbir sey gostermez —
 * kapali bir kampanyayi duyurmak yaniltici olurdu.
 *
 * Yasal: puanin yildiz sayisindan bagimsiz verildigi ve urun basina bir kez
 * gecerli oldugu her yerde yazar; metin tek kaynaktan (API'nin `disclosure`
 * alani) gelir ki arayuzler birbirinden ayrismasin.
 */
export function ReviewRewardBanner({ variant = "full", className = "" }: Props) {
  const { data } = useLoyaltyCampaignQuery();
  const campaign = data?.data;

  if (!campaign?.active) return null;

  const withImage = campaign.review_bonus_with_image_value;
  const noImage = campaign.review_bonus_no_image_value;

  if (variant === "compact") {
    return (
      <div
        className={`rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm ${className}`}
      >
        <p className="flex items-center gap-2 font-medium">
          <Camera className="h-4 w-4 shrink-0 text-primary" />
          Fotoğraflı değerlendirmeye {withImage} TL, fotoğrafsıza {noImage} TL puan
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{campaign.disclosure}</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/15 p-2">
          <Gift className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold">Değerlendir, puan kazan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Satın aldığınız ürünü değerlendirin: fotoğraflı değerlendirmeye{" "}
            <strong className="text-foreground">{withImage} TL</strong>, fotoğrafsıza{" "}
            <strong className="text-foreground">{noImage} TL</strong> değerinde puan.{" "}
            {campaign.min_redeem_value} TL&apos;ye ulaşınca indirim çekine
            dönüştürebilirsiniz.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {campaign.disclosure} Çekler {campaign.voucher_min_order} TL ve üzeri
            sepetlerde {campaign.voucher_valid_days} gün geçerlidir.{" "}
            {/* Kosullar sayfasi yayinda degilse API null doner; kirik link
                basmaktansa hic basmamak dogru. */}
            {campaign.terms_url && (
              <Link
                href={campaign.terms_url}
                className="underline underline-offset-2 hover:text-foreground"
              >
                Kampanya koşulları
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
