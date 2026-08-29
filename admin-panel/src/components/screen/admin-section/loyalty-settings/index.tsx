"use client";
import LoyaltySettingsForm from "@/components/blocks/admin-section/loyalty-settings/LoyaltySettingsForm";
import { Card, CardContent } from "@/components/ui";
import { AlertTriangle, ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

/**
 * Sayfa ici yonetim rehberi.
 *
 * Bu ayarlar dogrudan para demek: yanlis bir oran programi bir gecede
 * surdurulemez hale getirir, yanlis bir kapatma ise musteriye verilmis
 * puani gasp eder. Rehber bu yuzden formun ustunde, acilir kapanir bir
 * kartta duruyor — ilk kez yonetenin okumasi, sonra kapatmasi icin.
 */
const ManagementGuide = () => {
  const [open, setOpen] = useState(false);

  return (
    <Card className="mt-4">
      <CardContent className="p-2 md:p-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="flex items-center gap-2 font-semibold">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Bu sayfa nasıl yönetilir?
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="mt-4 space-y-5 text-sm leading-relaxed">
            <section>
              <h4 className="font-semibold">Program nasıl çalışır?</h4>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Müşteri iki yerden puan kazanır: siparişi{" "}
                <strong>teslim edildiğinde</strong> (ödendiğinde değil — iptal
                edilen sipariş hayalet puan bırakmasın diye) ve satın aldığı
                ürünü <strong>değerlendirdiğinde</strong>. Biriken puanı kendisine
                özel bir indirim çekine dönüştürür. Çek, mevcut kupon
                altyapısında çalışır: tek kullanımlık, minimum sepet şartlı,
                süreli ve yalnızca o müşteriye ait.
              </p>
            </section>

            <section>
              <h4 className="font-semibold">Bekleme süresi — iadeyi kurtaran ayar</h4>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Kazanılan puan hemen kullanılamaz;{" "}
                <strong>bekleme süresi</strong> kadar (varsayılan 14 gün)
                beklemede kalır, sonra kendiliğinden kullanıma açılır. Sebebi
                iade: müşteri puanı teslimat günü çeke çevirip harcarsa, beş gün
                sonra gelen iadede geri alınacak puan kalmaz. 14 gün, mesafeli
                satışta cayma hakkı süresidir — iade penceresi kapanmadan puan
                harcanamaz.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-600 dark:text-gray-300">
                <li>
                  Bekleyen puan iade edilirse <strong>sessizce silinir</strong>;
                  müşterinin kullanılabilir bakiyesine hiç dokunulmaz.
                </li>
                <li>
                  Puan açıldıktan sonra iade gelirse kullanılabilir bakiyeden
                  düşülür. Müşteri o puanı harcamışsa{" "}
                  <strong>borç çıkarılmaz</strong>: geri alma kalan bakiye kadar
                  kırpılır, fark mağazanın üstünde kalır ve loglanır.
                </li>
                <li>
                  Değişiklik <strong>geriye dönük değildir</strong>. Süreyi
                  uzatmak, hâlihazırda beklemedeki puanların açılış tarihini
                  değiştirmez.
                </li>
                <li>
                  <strong>0 yazmak beklemeyi kapatır.</strong> Program durumu
                  kartındaki &quot;Bekleyen puan&quot;, açık yükümlülüğün ne
                  kadarının hâlâ geri alınabilir olduğunu gösterir; 0&apos;a
                  ayarlarsanız bu güvenlik payı kaybolur.
                </li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold">İlk kez açarken sıra</h4>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-gray-600 dark:text-gray-300">
                <li>Oranları gözden geçirin, kaydedin (kazanım kapalıyken).</li>
                <li>
                  Koşullar sayfasını (<em>Sayfalar → Puan Programı Koşulları</em>)
                  okuyup <strong>yayınlayın</strong>. Şu an taslak; kampanyayı
                  yayınlanmamış koşullarla açmayın.
                </li>
                <li>
                  Sunucuda <code>php artisan loyalty:selftest</code> çalıştırın.
                  Canlıda güvenlidir, hiçbir kalıcı kayıt bırakmaz.
                </li>
                <li>
                  <strong>Puan kazanımı</strong> anahtarını açın. Kampanya
                  duyurusu (banner ve e-posta kutusu) ancak bu anahtar açıkken
                  görünür.
                </li>
              </ol>
            </section>

            <section>
              <h4 className="font-semibold">İki anahtar neden ayrı?</h4>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                <strong>Puan kazanımı</strong> yeni puan verilmesini,{" "}
                <strong>puan kullanımı</strong> birikmiş puanın bozdurulmasını
                kontrol eder. Programı bitirirken önce <em>yalnızca kazanımı</em>{" "}
                kapatın, kullanımı bir süre daha açık bırakın ve bu tarihi
                müşteriye duyurun. Birikmiş puan müşteriye verilmiş bir sözdür;
                iki anahtarı aynı anda kapatmak o sözü bozar ve müşteri
                kaybettirir.
              </p>
            </section>

            <section>
              <h4 className="font-semibold">&quot;Açık yükümlülük&quot; ne demek?</h4>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Bugün bütün müşteriler puanlarını bozdursa vermeniz gereken
                toplam indirim. Muhasebe anlamında bir borç kalemi gibi düşünün:
                dağıttığınız puan arttıkça büyür, çekler kullanıldıkça erir.
                Düzenli takip edin; beklenmedik şekilde büyüyorsa oranlar fazla
                cömerttir. Yanındaki <strong>bekleyen puan</strong>, bu
                yükümlülüğün henüz kesinleşmemiş — iade halinde geri
                alınabilecek — kısmıdır.
              </p>
            </section>

            <section>
              <h4 className="font-semibold">Oranları değiştirirken</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-600 dark:text-gray-300">
                <li>
                  Kazanma ve harcama oranları <strong>birlikte</strong> anlam
                  taşır. &quot;1 TL kaç puan&quot; tek başına bir şey söylemez;
                  önemli olan formun aşağısında gösterilen{" "}
                  <strong>ciro üzerinden yüzde kaç geri verildiği</strong>.
                </li>
                <li>
                  Bu oran <strong>platform komisyonunuzun altında</strong>{" "}
                  kalmalı. Aksi halde her sipariş zararına çalışır.
                </li>
                <li>
                  Değişiklik <strong>geriye dönük değildir</strong>: daha önce
                  yazılmış puanlar eski oranla verilmiştir, bozdurma yeni oranla
                  yapılır. Harcama oranını düşürürseniz birikmiş puanın değeri
                  düşer — duyurmadan yapmayın.
                </li>
                <li>
                  Değerlendirme bonusu <strong>ürün başına bir kez</strong>{" "}
                  verilir ve <strong>yıldız sayısından bağımsızdır</strong>. Bu
                  ikisi yasal zorunluluktur, arayüzde de açıkça yazar.
                </li>
                <li>
                  <strong>Puan geçerlilik süresi</strong>, bekleme bittikten
                  sonra başlar; 14 günlük bekleme müşterinin kullanma süresinden
                  kesilmez.
                </li>
              </ul>
            </section>

            <section className="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <h4 className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Dikkat
              </h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-amber-900 dark:text-amber-300">
                <li>
                  Efektif geri verme oranı <strong>%20&apos;yi aşamaz</strong>;
                  aşan kayıtlar reddedilir ve <em>hiçbir</em> ayar yazılmaz.
                  Hata mesajı hangi oranın çıktığını söyler.
                </li>
                <li>
                  &quot;1 TL kaç puan&quot; alanına <strong>1</strong> yazmak
                  normaldir. Buraya 100 yazmak, siparişin neredeyse tamamını geri
                  vermek demektir.
                </li>
                <li>
                  Kaydettiğiniz an geçerli olur; yayın öncesi denemelerinizi
                  kazanım anahtarı kapalıyken yapın.
                </li>
                <li>
                  <strong>Bekleme süresini 0 yapmayın.</strong> İade korumasını
                  kapatan tek ayar budur; 14 gün, cayma hakkı süresiyle
                  hizalıdır.
                </li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold">Açtıktan sonra ne izlenir?</h4>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                İlk hafta günlük, sonra haftalık: dağıtılan puan, üretilen ve
                kullanılan çek sayısı, açık yükümlülük. Asıl ölçü{" "}
                <strong>kullanılan çek tutarı ÷ ciro</strong> — hedef %1
                civarıdır. Tek tek müşterilerin hareketleri ve elle düzeltme{" "}
                <em>Sadakat Puanları</em> sayfasındadır.
              </p>
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const LoyaltySettings = () => {
  return (
    <div>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
              Sadakat Puanı Ayarları
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Müşteriler teslim edilen siparişlerden ve onaylanan
              değerlendirmelerden puan kazanır. Puanlar bekleme süresi
              (varsayılan 14 gün) dolduktan sonra kullanıma açılır ve kişiye
              özel indirim çekine dönüştürülür.
            </p>
          </div>
        </CardContent>
      </Card>

      <ManagementGuide />

      <LoyaltySettingsForm />
    </div>
  );
};

export default LoyaltySettings;
