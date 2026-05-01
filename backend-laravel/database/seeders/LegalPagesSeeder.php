<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Aydınlatma Metni, KVKK Açık Rıza Beyanı ve Üye Sözleşmesi sayfalarını
 * `pages` tablosuna idempotent olarak ekler / günceller. Yasal danışman
 * inceleyip değişiklik isterse içerik admin panelden veya bu seeder'ı
 * güncelleyip yeniden çalıştırarak değiştirilebilir.
 *
 * Çalıştırma:
 *   php artisan db:seed --class=LegalPagesSeeder
 *
 * NOT: Aşağıdaki metinler genel KVKK / mesafeli satış mevzuatına dayanan
 * BAŞLANGIÇ TASLAKLARIDIR; sportoonline.com için güncel bilgiler ([ŞİRKET
 * BİLGİLERİ], [İLETİŞİM] gibi yer tutucular) doldurulmalı ve hukuk
 * danışmanı tarafından onaylanmalıdır.
 */
class LegalPagesSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'aydinlatma-metni',
                'title' => 'Aydınlatma Metni',
                'meta_title' => 'Aydınlatma Metni - Sportoonline',
                'meta_description' => 'Sportoonline kişisel verilerin işlenmesine ilişkin KVKK aydınlatma metni.',
                'content' => $this->aydinlatmaMetni(),
            ],
            [
                'slug' => 'kvkk-acik-riza',
                'title' => 'KVKK Açık Rıza Beyanı',
                'meta_title' => 'KVKK Açık Rıza Beyanı - Sportoonline',
                'meta_description' => 'Sportoonline KVKK kapsamında açık rıza beyanı.',
                'content' => $this->kvkkAcikRiza(),
            ],
            [
                'slug' => 'uye-sozlesmesi',
                'title' => 'Üye Sözleşmesi',
                'meta_title' => 'Üye Sözleşmesi - Sportoonline',
                'meta_description' => 'Sportoonline üye sözleşmesi ve kullanım koşulları.',
                'content' => $this->uyeSozlesmesi(),
            ],
        ];

        foreach ($pages as $page) {
            DB::table('pages')->updateOrInsert(
                ['slug' => $page['slug']],
                array_merge($page, [
                    'theme_name' => 'default',
                    'page_type' => 'dynamic_page',
                    'layout' => 'default',
                    'enable_builder' => 0,
                    'show_breadcrumb' => 1,
                    'page_order' => 0,
                    'status' => 'publish',
                    'updated_at' => now(),
                    'created_at' => now(),
                ])
            );
        }

        $this->command->info('LegalPagesSeeder: 3 yasal sayfa eklendi/güncellendi (aydinlatma-metni, kvkk-acik-riza, uye-sozlesmesi).');
    }

    private function aydinlatmaMetni(): string
    {
        return <<<'HTML'
<h2>Veri Sorumlusunun Kimliği</h2>
<p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla Sportoonline tarafından aşağıda açıklanan kapsamda işlenmektedir.</p>
<ul>
  <li><strong>Ünvan:</strong> Sportoonline Lifestyle Hub</li>
  <li><strong>İnternet Adresi:</strong> https://sportoonline.com</li>
  <li><strong>İletişim:</strong> info@sportoonline.com</li>
</ul>

<h2>İşlenen Kişisel Veriler</h2>
<p>Üyelik, sipariş ve site kullanımı sırasında aşağıdaki veri kategorileri işlenebilir:</p>
<ul>
  <li><strong>Kimlik:</strong> ad, soyad, T.C. kimlik no (fatura için talep edilirse)</li>
  <li><strong>İletişim:</strong> e-posta, telefon, fatura/teslimat adresi</li>
  <li><strong>Müşteri İşlem:</strong> sipariş geçmişi, sepet, fatura, ödeme yöntemi (kart numarası saklanmaz, yalnızca PCI-DSS sertifikalı ödeme sağlayıcılarına iletilir)</li>
  <li><strong>İşlem Güvenliği:</strong> IP adresi, oturum çerez bilgileri, log kayıtları</li>
  <li><strong>Pazarlama:</strong> alışveriş alışkanlıkları, çerez tercihleri (yalnızca açık rıza halinde)</li>
</ul>

<h2>Kişisel Verilerin İşlenme Amaçları</h2>
<ul>
  <li>Üyelik kaydı, hesap güvenliği ve oturum yönetimi</li>
  <li>Sipariş alma, ödeme tahsilatı, kargo ve teslimat süreçleri</li>
  <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, e-fatura, iade kayıtları)</li>
  <li>Müşteri destek talepleri ve şikayet yönetimi</li>
  <li>Site güvenliği, hile ve dolandırıcılığın önlenmesi</li>
  <li>Açık rıza halinde pazarlama, kampanya bildirimi ve kişiselleştirme</li>
</ul>

<h2>İşlemenin Hukuki Sebepleri</h2>
<p>Verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenir:</p>
<ul>
  <li>Sözleşmenin kurulması veya ifası için zorunlu olması (üyelik, sipariş)</li>
  <li>Kanunlarda açıkça öngörülmesi (e-fatura, vergi mevzuatı)</li>
  <li>Veri sorumlusunun meşru menfaati (site güvenliği, dolandırıcılık tespiti)</li>
  <li>Açık rızanız (ticari elektronik ileti, kişiselleştirilmiş pazarlama)</li>
</ul>

<h2>Verilerin Aktarımı</h2>
<p>Kişisel verileriniz, hizmetin sunulabilmesi için zorunlu olduğu ölçüde aşağıdaki taraflarla paylaşılır:</p>
<ul>
  <li>Ödeme aracılık kuruluşları (PayTR, iyzico vb.)</li>
  <li>Kargo ve lojistik firmaları (sipariş teslimatı için)</li>
  <li>E-fatura ve muhasebe servisleri (yasal zorunluluk)</li>
  <li>Yetkili kamu kurumları (mahkeme kararı, kanunen zorunluysa)</li>
  <li>Bulut altyapı sağlayıcıları (yurt içi/yurt dışı veri merkezleri)</li>
</ul>

<h2>Saklama Süresi</h2>
<p>Verileriniz, ilgili işleme amacının gerektirdiği süre boyunca, ardından yasal saklama süreleri (Vergi Usul Kanunu, Türk Ticaret Kanunu vb.) sona erene kadar saklanır. Süre sonunda silinir veya anonimleştirilir.</p>

<h2>İlgili Kişinin Hakları</h2>
<p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
<ul>
  <li>İşlenen verileriniz hakkında bilgi talep etme</li>
  <li>İşleme amacını ve uygunluğunu öğrenme</li>
  <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini talep etme</li>
  <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini talep etme</li>
  <li>Aktarıldığı üçüncü kişilere bu işlemlerin bildirilmesini talep etme</li>
  <li>Münhasıran otomatik sistemler ile analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme</li>
  <li>Verilerinizin kanuna aykırı işlenmesi sonucu zarara uğramanız halinde tazminat talep etme</li>
</ul>

<p>Bu haklarınızı kullanmak için <a href="mailto:kvkk@sportoonline.com">kvkk@sportoonline.com</a> adresine başvurabilirsiniz.</p>

<p><em>Bu metin <strong>2026-05-01</strong> tarihinde güncellenmiştir. Güncel versiyonu daima bu sayfada yayınlanır.</em></p>
HTML;
    }

    private function kvkkAcikRiza(): string
    {
        return <<<'HTML'
<h2>Açık Rıza Beyanı</h2>
<p>Sportoonline tarafından, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, <a href="/tr/aydinlatma-metni">Aydınlatma Metni</a>'nde ayrıntıları açıklanan kişisel verilerimin aşağıda belirtilen amaçlar doğrultusunda işlenmesine açık rıza gösterdiğimi beyan ederim.</p>

<h2>Rıza Verilen İşleme Amaçları</h2>

<h3>1. Pazarlama ve Kampanya İletişimi</h3>
<p>Tarafıma e-posta, SMS, anlık bildirim ve diğer elektronik kanallar üzerinden Sportoonline'ın kampanya, indirim, yeni ürün ve kişiselleştirilmiş tekliflerine ilişkin ticari elektronik ileti gönderilebileceğini kabul ediyorum.</p>

<h3>2. Profil Oluşturma ve Kişiselleştirme</h3>
<p>Site üzerindeki davranışlarımın (görüntülenen ürünler, sepet, alışveriş geçmişi) ve tercih çerezlerimin analiz edilerek bana özel ürün önerileri ve içerik gösterilmesine onay veriyorum.</p>

<h3>3. Üçüncü Kişi Pazarlama Ortaklarıyla Paylaşım</h3>
<p>Verilerimin, yalnızca pazarlama amacıyla, sözleşmeli reklam ve analitik partnerleri (ör. Google, Meta) ile sınırlı ve anonimleştirilmiş şekilde paylaşılmasına onay veriyorum.</p>

<h2>Hak ve Yükümlülükler</h2>
<ul>
  <li>Bu rızam kapsamında işlenen verilerimin saklanma süresi, ilgili amaç sona erene veya rızamı geri çekene kadar olan süredir.</li>
  <li>Rızamı dilediğim zaman <a href="mailto:kvkk@sportoonline.com">kvkk@sportoonline.com</a> adresine yazılı olarak başvurarak veya hesabım üzerinden geri çekebilirim. Geri çekme, geçmişteki işlemlerin hukuka uygunluğunu etkilemez.</li>
  <li>Rıza vermemem halinde de Sportoonline üzerinden alışveriş yapabilirim; rıza yalnızca yukarıdaki amaçlar için aranır.</li>
</ul>

<h2>Onay</h2>
<p>Yukarıda belirtilen amaçlar ve <a href="/tr/aydinlatma-metni">Aydınlatma Metni</a>'nde açıklanan koşullar çerçevesinde kişisel verilerimin işlenmesine açık rıza veriyorum.</p>

<p><em>Bu metin <strong>2026-05-01</strong> tarihinde güncellenmiştir.</em></p>
HTML;
    }

    private function uyeSozlesmesi(): string
    {
        return <<<'HTML'
<h2>1. Taraflar</h2>
<p>İşbu Üye Sözleşmesi ("Sözleşme"), <strong>Sportoonline Lifestyle Hub</strong> ("Sportoonline") ile <strong>https://sportoonline.com</strong> ("Site") üzerinde üye olan kullanıcı ("Üye") arasında akdedilmiştir.</p>

<h2>2. Sözleşmenin Konusu</h2>
<p>Site üzerinden Sportoonline'ın sunduğu hizmetlerden Üye'nin yararlanma şart ve koşullarını, tarafların hak ve yükümlülüklerini düzenler.</p>

<h2>3. Üyelik</h2>
<ul>
  <li>Üyelik için 18 yaşından büyük olmak veya yasal temsilcinin onayı gereklidir.</li>
  <li>Üye, kayıt sırasında verdiği bilgilerin doğru ve güncel olduğunu beyan eder.</li>
  <li>Üye, hesap şifresinin gizliliğinden ve hesap altında yapılan tüm işlemlerden sorumludur.</li>
  <li>Sportoonline, sözleşme ihlali, sahte bilgi veya kötüye kullanım tespiti halinde üyeliği askıya alma veya sonlandırma hakkını saklı tutar.</li>
</ul>

<h2>4. Hizmetler</h2>
<p>Site üzerinden:</p>
<ul>
  <li>Ürün inceleme, sepete ekleme ve sipariş verme</li>
  <li>Mağaza profili oluşturma ve ürün satışı (satıcı üyeler için ayrıca <a href="/tr/satici-basvuru">başvuru</a> gerekir)</li>
  <li>Yorum yapma, ürün puanlama, soru-cevap</li>
  <li>Cüzdan, kupon ve sadakat programı kullanımı</li>
</ul>
<p>gibi hizmetlerden faydalanabilirsiniz.</p>

<h2>5. Ücretler ve Ödeme</h2>
<ul>
  <li>Ürün ve hizmet bedelleri site üzerinde TL cinsinden gösterilir; KDV dahildir aksi belirtilmedikçe.</li>
  <li>Ödemeler PCI-DSS sertifikalı ödeme aracıları (PayTR, iyzico vb.) üzerinden yapılır; kart bilgileri Sportoonline'da saklanmaz.</li>
  <li>Sipariş onayından sonra fiyat değişiklikleri zaten verilmiş siparişi etkilemez.</li>
</ul>

<h2>6. Teslimat, İade ve Cayma Hakkı</h2>
<ul>
  <li>Teslimat süreleri ürün sayfasında ve sipariş onayında belirtilir; mücbir sebepler hariç.</li>
  <li>Mesafeli Sözleşmeler Yönetmeliği uyarınca Üye, ürünü teslim aldığı tarihten itibaren <strong>14 gün</strong> içinde cayma hakkına sahiptir.</li>
  <li>İade ve değişim koşulları için <a href="/tr/iade-degisim">İade Politikası</a> sayfasını inceleyiniz.</li>
</ul>

<h2>7. Üye Yükümlülükleri</h2>
<p>Üye:</p>
<ul>
  <li>Site'yi yasalara, ahlaka ve genel koşullara aykırı şekilde kullanmayacağını,</li>
  <li>Başkalarının fikri mülkiyet haklarını ihlal etmeyeceğini,</li>
  <li>Yorumlarda hakaret, ayrımcılık, spam veya yanıltıcı içerik paylaşmayacağını,</li>
  <li>Site'nin güvenliğini tehdit edecek (botla otomasyon, scraping, sızma testi vb.) eylemler yapmayacağını</li>
</ul>
<p>kabul ve taahhüt eder. Aksi halde Sportoonline üyeliği derhal sonlandırma ve hukuki yollara başvurma hakkına sahiptir.</p>

<h2>8. Fikri Mülkiyet</h2>
<p>Site'deki tüm marka, logo, içerik ve yazılım Sportoonline'a veya lisansörlerine aittir; izinsiz kopyalanamaz, çoğaltılamaz, dağıtılamaz.</p>

<h2>9. Kişisel Verilerin Korunması</h2>
<p>Üye'nin kişisel verileri, <a href="/tr/aydinlatma-metni">Aydınlatma Metni</a> ve <a href="/tr/kvkk-acik-riza">KVKK Açık Rıza Beyanı</a>'nda belirtilen koşullar çerçevesinde işlenir.</p>

<h2>10. Sözleşmede Değişiklik</h2>
<p>Sportoonline, işbu Sözleşme'yi tek taraflı olarak güncelleyebilir. Güncel versiyon her zaman bu sayfada yayınlanır; Üye, güncel sözleşmeyi takip etmekle yükümlüdür. Güncellemeden sonra Site'yi kullanmaya devam eden Üye, yeni hükümleri kabul etmiş sayılır.</p>

<h2>11. Uygulanacak Hukuk ve Yetki</h2>
<p>İşbu Sözleşme'den doğan uyuşmazlıklarda Türk hukuku uygulanır ve İstanbul Mahkemeleri ile İcra Daireleri yetkilidir.</p>

<h2>12. İletişim</h2>
<p>Sözleşme'ye ilişkin sorularınız için: <a href="mailto:info@sportoonline.com">info@sportoonline.com</a></p>

<p><em>Bu sözleşme <strong>2026-05-01</strong> tarihinde güncellenmiştir.</em></p>
HTML;
    }
}
