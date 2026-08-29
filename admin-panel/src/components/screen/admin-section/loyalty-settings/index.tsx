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
              <h4 className="font-semibold">Üç cümlede program</h4>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-gray-600 dark:text-gray-300">
                <li>
                  Müşteri <strong>siparişi teslim alınca</strong> ve{" "}
                  <strong>aldığı ürünü değerlendirince</strong> puan kazanır.
                </li>
                <li>
                  Puan <strong>14 gün beklemede</strong> kalır — iade süresi
                  boyunca harcanamaz.
                </li>
                <li>
                  Sonra puanını <strong>kendisine özel bir indirim çekine</strong>{" "}
                  çevirip kullanır.
                </li>
              </ol>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Puan ödeme anında değil <strong>teslimatta</strong> yazılır; iptal
                edilen sipariş hayalet puan bırakmasın diye. Çek mevcut kupon
                altyapısında çalışır: tek kullanımlık, minimum sepet şartlı,
                süreli ve yalnızca o müşteriye ait.
              </p>
            </section>

            <section>
              <h4 className="font-semibold">En önemli kural: 1 puan = 1 TL</h4>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                &quot;Kaç puan&quot; ve &quot;kaç TL eder&quot; alanlarının{" "}
                <strong>ikisi de 1</strong> olduğu sürece puan ile TL aynı şeydir:
                müşteri 25 puan görüyorsa 25 TL demektir, sizin de kafanız
                karışmaz. Değerlendirme bonusu alanlarına yazdığınız sayı da
                doğrudan TL karşılığıdır.
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Bu kuru bozarsanız (örn. 1000 puan = 10 TL) her ekranda çevrim
                yapmak gerekir. Kazanma hızını ayarlamak isterseniz kuru değil{" "}
                <strong>&quot;1 TL alışveriş kaç puan&quot;</strong> alanını
                değiştirin — formun üstündeki mavi kutu sonucu anında yazar.
              </p>
            </section>

            <section>
              <h4 className="font-semibold">Hangi alan ne işe yarar?</h4>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left">
                  <thead>
                    <tr className="border-b text-xs uppercase text-gray-500">
                      <th className="py-1 pr-3 font-medium">Alan</th>
                      <th className="py-1 pr-3 font-medium">Ne yapar</th>
                      <th className="py-1 font-medium">Yükseltirsen</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 dark:text-gray-300">
                    <tr className="border-b">
                      <td className="py-1.5 pr-3">1 TL kaç puan</td>
                      <td className="py-1.5 pr-3">Kazanma hızı</td>
                      <td className="py-1.5">Maliyet artar (ana kalem)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 pr-3">Değerlendirme bonusu</td>
                      <td className="py-1.5 pr-3">Yorum teşviki</td>
                      <td className="py-1.5">Daha çok yorum, ürün başına tek sefer</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 pr-3">Çek için gereken puan</td>
                      <td className="py-1.5 pr-3">Bozdurma eşiği</td>
                      <td className="py-1.5">Müşteri daha geç ödül alır</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 pr-3">Çekin min. sepeti</td>
                      <td className="py-1.5 pr-3">İndirimin gerçek oranı</td>
                      <td className="py-1.5">Maliyet düşer (asıl fren)</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3">Bekleme süresi</td>
                      <td className="py-1.5 pr-3">İade koruması</td>
                      <td className="py-1.5">Koruma artar, ödül geç hissedilir</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
                  Tek bir alana bakarak karar vermeyin. Önemli olan{" "}
                  <strong>ciro üzerinden yüzde kaç geri verildiği</strong> —
                  formun üstündeki mavi kutu bunu ve ortalama siparişinizdeki TL
                  karşılığını yazar.
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
                  1 puan = 1 TL kurunda &quot;1 TL kaç puan&quot; alanına{" "}
                  <strong>0,01</strong> yazmak %1 geri verir. Buraya{" "}
                  <strong>1</strong> yazmak siparişin <strong>tamamını</strong>{" "}
                  geri vermek demektir — sunucu zaten reddeder.
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
              değerlendirmelerden puan kazanır. <strong>1 puan = 1 TL.</strong>{" "}
              Puanlar 14 gün beklemede kaldıktan sonra kullanıma açılır ve
              kişiye özel indirim çekine dönüştürülür.
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
