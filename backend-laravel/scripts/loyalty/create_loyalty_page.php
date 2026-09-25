<?php
// Sadakat programi kosullari sayfasini TASLAK olarak olusturur.
// Metindeki sayilar canli ayarlardan okunur; ayar degisirse sayfa da
// guncellenmelidir (bu script tekrar calistirilabilir).

use App\Models\Page;
use App\Services\Loyalty\LoyaltyService;

$loyalty = app(LoyaltyService::class);

$earn = $loyalty->earnPerCurrency();
$unit = number_format($loyalty->redeemPointsPerUnit(), 0, ',', '.');
$unitValue = $loyalty->redeemValue();
$minPoints = number_format($loyalty->minRedeemPoints(), 0, ',', '.');
$minValue = $loyalty->pointsToCurrency($loyalty->minRedeemPoints());
$minOrder = $loyalty->voucherMinOrder();
$validDays = $loyalty->voucherValidDays();
$expireDays = $loyalty->pointsExpireDays();
$bonusImage = (int) (com_option_get('com_loyalty_review_bonus_with_image') ?: 2000);
$bonusPlain = (int) (com_option_get('com_loyalty_review_bonus_no_image') ?: 1000);
$bonusImageValue = $loyalty->pointsToCurrency($bonusImage);
$bonusPlainValue = $loyalty->pointsToCurrency($bonusPlain);
$maxPerOrder = $loyalty->reviewMaxPerOrder();
$holdDays = $loyalty->holdDays();

// Kazanma orani 1'in altindaysa oran TERS yazilir: "her 100 TL'ye 1 puan".
// "1 TL'ye 0,01 puan" kimsenin zihninde canlanmiyor.
// Alisveris puani kapaliysa (earn = 0) kosullarda BAHSEDILMEZ. Olmayan bir
// kazanimi kosullar metninde vaat etmek yaniltici olur.
$purchaseLine = '';
if ($earn > 0) {
    $earnSentence = $earn < 1
        ? 'her ' . number_format(round(1 / $earn), 0, ',', '.') . ' TL alışverişiniz için <strong>1 puan</strong>'
        : 'her 1 TL alışverişiniz için <strong>' . $earn . ' puan</strong>';
    $purchaseLine = "<li><strong>Alışveriş:</strong> Siparişiniz <strong>teslim edildiğinde</strong>, {$earnSentence} hesabınıza eklenir. Puan, ödeme anında değil teslimat tamamlandığında yazılır.</li>";
}

// Puan ile TL birebirse cevrim cumlesi kurulmaz.
$oneToOne = ((int) $loyalty->redeemPointsPerUnit() === 1) && ((float) $loyalty->redeemValue() === 1.0);
$rateLine = $oneToOne
    ? '<li><strong>1 puan = 1 TL.</strong> Ekranda gördüğünüz puan, doğrudan TL karşılığıdır.</li>'
    : "<li>{$unit} puan = {$unitValue} TL indirim çeki değerindedir.</li>";

// Bekleme suresi kapatilmissa (0) o cumleyi hic yazma; olmayan bir kurali
// kosullarda vaat etmek yaniltici olur.
$holdSentence = $holdDays > 0
    ? "<p><strong>Kazanılan puanlar {$holdDays} gün beklemede kalır</strong> ve bu sürenin sonunda kullanıma açılır. Bekleme süresi, siparişinizi iade etme hakkınızın bulunduğu süreye denk gelir; puanlarınız bu süre dolduktan sonra çeke dönüştürülebilir. Bekleyen puanlarınızı ve ne zaman kullanıma açılacaklarını <em>Hesabım &gt; Puanlarım</em> sayfasından görebilirsiniz.</p>"
    : '';

$content = <<<HTML
<h2>Sportoonline Puan Programı Koşulları</h2>
<p>Puan programı, satın aldığınız ürünler için paylaştığınız değerlendirmelerden puan kazanmanızı ve bu puanları indirim çekine dönüştürmenizi sağlar. Aşağıdaki koşullar programın işleyişini açıklar.</p>

<h3>1. Puan Nasıl Kazanılır?</h3>
<ul>
{$purchaseLine}
<li><strong>Değerlendirme:</strong> Satın aldığınız bir ürünü değerlendirdiğinizde ve değerlendirmeniz yayınlandığında puan kazanırsınız: fotoğraflı değerlendirme için <strong>{$bonusImageValue} TL</strong>, fotoğrafsız değerlendirme için <strong>{$bonusPlainValue} TL</strong> değerinde puan. <strong>Her ürün için yalnızca bir kez</strong> geçerlidir; aynı ürünü tekrar satın alıp yeniden değerlendirseniz de ikinci kez puan verilmez. Tek siparişte en fazla {$maxPerOrder} ürün değerlendirmesi puan kazandırır.</li>
</ul>
{$holdSentence}
<p><strong>Değerlendirme puanı verdiğiniz yıldız sayısından bağımsızdır.</strong> Olumlu ya da olumsuz, her gerçek değerlendirme aynı puanı kazanır. Puan kazanılan değerlendirmeler, ürün sayfasında "Puan kazanılan değerlendirme" ibaresiyle gösterilir.</p>

<h3>2. Puan Nasıl Kullanılır?</h3>
<ul>
{$rateLine}
<li>En az <strong>{$minPoints} puan</strong> ({$minValue} TL) biriktirdiğinizde çek oluşturabilirsiniz.</li>
<li>Oluşturduğunuz çek yalnızca size özeldir, başka bir hesapta kullanılamaz.</li>
<li>Çekler <strong>{$minOrder} TL ve üzeri</strong> sepetlerde geçerlidir.</li>
<li>Her çek <strong>bir kez</strong> kullanılabilir ve oluşturulduğu tarihten itibaren <strong>{$validDays} gün</strong> geçerlidir.</li>
<li>Puanlarınızı ve çeklerinizi <em>Hesabım &gt; Puanlarım</em> sayfasından görebilirsiniz.</li>
</ul>

<h3>3. Puanların Geçerlilik Süresi</h3>
<p>Puanlar, <strong>kullanıma açıldıkları tarihten</strong> itibaren {$expireDays} gün boyunca geçerlidir; bekleme süresi bu süreden düşülmez. Sportoonline, bu sürenin sonunda kullanılmamış puanları geçersiz sayma hakkını saklı tutar.</p>

<h3>4. İptal ve İade</h3>
<p>Bir siparişiniz iptal edilir veya iade edilirse, o siparişten kazandığınız puanlar — <strong>o siparişteki ürünler için aldığınız değerlendirme puanları dahil</strong> — geri alınır. Bekleme süresi tam da bunun içindir:</p>
<ul>
<li>Puanlar <strong>hâlâ beklemedeyse</strong> (olağan durum), henüz kullanamadığınız için puanlar sessizce iptal edilir. Kullanılabilir bakiyenize dokunulmaz.</li>
<li>Puanlar <strong>kullanıma açıldıktan sonra</strong> iade yapılırsa, geri alma kullanılabilir bakiyenizden düşülür. O puanları çoktan harcamışsanız <strong>size borç çıkarılmaz</strong>; geri alma yalnızca kalan bakiyeniz kadar uygulanır ve bakiyeniz eksiye düşmez.</li>
</ul>

<h3>5. Programda Değişiklik ve Sonlandırma</h3>
<p>Sportoonline, puan kazanım ve kullanım oranlarını değiştirme veya programı sonlandırma hakkını saklı tutar. Program sonlandırılırsa, yeni puan kazanımı durdurulur; <strong>hesabınızda birikmiş puanlar duyurulacak bir tarihe kadar kullanılabilir kalır</strong>. Oluşturulmuş çekler kendi geçerlilik süreleri boyunca kullanılabilir.</p>

<h3>6. Kötüye Kullanım</h3>
<p>Sahte değerlendirme, gerçek olmayan sipariş veya sistemin amacı dışında kullanımı tespit edilen hesapların puanları iptal edilebilir ve hesap programdan çıkarılabilir.</p>

<h3>7. İletişim</h3>
<p>Puan programıyla ilgili sorularınız için müşteri hizmetlerimize ulaşabilirsiniz.</p>
HTML;

// YAYIN DURUMUNA DOKUNMA. Bu script oranlar degistiginde TEKRAR
// calistirilmak icin var; sabit 'draft' yazmak, yayindaki kosullar sayfasini
// sessizce taslaga dusurur ve kampanya yine kosulsuz kalirdi. Durum yalnizca
// sayfa ILK kez olusturulurken belirlenir.
$existing = Page::where('slug', 'sadakat-programi')->first();

$page = Page::updateOrCreate(
    ['slug' => 'sadakat-programi'],
    [
        'theme_name' => 'default',
        'page_type' => 'dynamic_page',
        'layout' => 'default',
        'enable_builder' => 0,
        'show_breadcrumb' => 1,
        'page_order' => 0,
        'title' => 'Puan Programı Koşulları',
        'content' => $content,
        'meta_title' => 'Puan Programı Koşulları | Sportoonline',
        'meta_description' => 'Sportoonline puan programı: alışveriş ve değerlendirmelerden puan kazanın, indirim çekine dönüştürün. Kazanım, kullanım ve geçerlilik koşulları.',
        // Yeni olusturuluyorsa taslak (hukuki metin gozden gecirilmeden
        // yayina cikmasin); mevcutsa yoneticinin belirledigi durum korunur.
        'status' => $existing->status ?? 'draft',
    ]
);

echo 'Sayfa ' . ($page->wasRecentlyCreated ? 'olusturuldu' : 'guncellendi') . ': #' . $page->id . ' /' . $page->slug . PHP_EOL;
echo 'Durum: ' . $page->status
    . ($page->status === 'publish' ? ' (korundu)' : ' — yayinlamak icin admin panelden publish yapin')
    . PHP_EOL;
echo 'content tipi: ' . gettype($page->content) . ', uzunluk: ' . strlen($page->content) . PHP_EOL;
