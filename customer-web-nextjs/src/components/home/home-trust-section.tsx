import { Link } from "@/i18n/routing";
import { PackageCheck, ShieldCheck, Truck, Headset } from "lucide-react";
import { cleanContactPhone } from "@/lib/seo";

/**
 * Ana sayfanin alt kismindaki tanitim ve guvence bolumu.
 *
 * Tanitio raporu (2026-09-12) ana sayfada iki bagli bulgu verdi:
 *
 * 1. E-E-A-T 30/100 — 3/11 guven sinyali. Eksik olanlar "guvence: iade,
 *    garanti, guvenli odeme" ve "iletisim sayfasi ve ulasilabilirlik"ti.
 *    Bu bilgiler footer'da vardi ama denetim guven sinyallerini <main>
 *    icinden okuyor; footer'a bakmiyor.
 *
 * 2. Anahtar kelime tutarliligi 48/100 — "baslik/aciklamada gecip metinde
 *    neredeyse hic gecmeyen kavramlar: kaliteli, ayakkabi, ekipmanlari,
 *    kesfedin". Meta aciklamasi bunlari soyluyordu, govde metni soylemiyordu.
 *
 * Bolum ikisini birlikte kapatir: aciklamadaki kavramlari dogal bir paragrafa
 * tasir ve guvence ile iletisim bilgisini ana icerige yazar. Telefon yalniz
 * ayarlarda gercek bir numara varsa gosterilir (cleanContactPhone placeholder
 * numaralari eler) — uydurma iletisim bilgisi yazilmaz.
 */
interface Props {
  siteName: string;
  contactNumber?: string | null;
  returnDays?: number | null;
}

export function HomeTrustSection({ siteName, contactNumber, returnDays }: Props) {
  const phone = cleanContactPhone(contactNumber);
  const returnText =
    returnDays && returnDays > 0
      ? `Teslim aldığınız ürünü ${returnDays} gün içinde iade edebilirsiniz.`
      : "Ürünü teslim aldıktan sonra iade süresi içinde gerekçe belirtmeden geri gönderebilirsiniz.";

  const items = [
    {
      icon: <PackageCheck className="h-5 w-5" aria-hidden="true" />,
      title: "Kolay iade ve değişim",
      body: returnText,
      href: "/iade-degisim",
      linkText: "İade ve değişim koşulları",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />,
      title: "Güvenli ödeme",
      body:
        "Kart ödemeleri 3D Secure doğrulamasıyla alınır; kart bilgileriniz mağazada saklanmaz. Kapıda ödeme ve havale seçenekleri de bulunur.",
      href: "/kullanim-kosullari",
      linkText: "Ödeme ve üyelik kuralları",
    },
    {
      icon: <Truck className="h-5 w-5" aria-hidden="true" />,
      title: "Hızlı kargo",
      body:
        "Siparişiniz satıcı mağazasından kargoya verilir; takip numarası sipariş detayınıza ve e-postanıza iletilir.",
      href: "/kargo-politikasi",
      linkText: "Kargo politikası",
    },
    {
      icon: <Headset className="h-5 w-5" aria-hidden="true" />,
      title: "Müşteri desteği",
      body: phone
        ? `Sipariş, kargo ve iade sorularınız için ${phone} numarasından veya iletişim sayfasından bize ulaşabilirsiniz.`
        : "Sipariş, kargo ve iade sorularınız için iletişim sayfasından bize ulaşabilirsiniz.",
      href: "/iletisim",
      linkText: "İletişim sayfası",
    },
  ];

  return (
    <section
      aria-labelledby="anasayfa-guvence-basligi"
      className="rounded-lg border bg-card p-5 sm:p-6"
    >
      <h2
        id="anasayfa-guvence-basligi"
        className="text-xl font-extrabold tracking-tight text-foreground"
      >
        {siteName} alışveriş güvencesi
      </h2>
      <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground">
        {siteName}, birden fazla satıcının kendi mağazasıyla listelendiği bir spor
        pazaryeridir. Kaliteli spor giyim, ayakkabı, fitness ekipmanları, sporcu
        besinleri ve outdoor ürünlerini tek yerde keşfedin; ürün sayfasında
        satıcıyı, güncel fiyatı ve stok durumunu birlikte görün. Fiyat ve stok
        bilgisi satıcı kaynağından her gün güncellenir, böylece sepete
        eklediğiniz ürün gerçekten satışta olur.
      </p>
      <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {item.icon}
            </div>
            <div className="min-w-0">
              <dt className="text-sm font-bold text-foreground">{item.title}</dt>
              <dd className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {item.body}{" "}
                <Link
                  href={item.href}
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  {item.linkText}
                </Link>
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
