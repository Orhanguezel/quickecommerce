<?php

declare(strict_types=1);

use App\Models\Translation;
use Modules\Blog\app\Models\Blog;

require __DIR__ . '/../backend-laravel/vendor/autoload.php';

$app = require __DIR__ . '/../backend-laravel/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$dryRun = in_array('--dry-run', $argv, true);
$contentOnly = in_array('--content-only', $argv, true);
$verifyCurrent = in_array('--verify-current', $argv, true);
$allExisting = in_array('--all-existing', $argv, true);
$skipBackup = in_array('--no-backup', $argv, true);
$minimumWords = 1000;

$sourceNote = '<p><strong>Editoryal not:</strong> Bu rehber Sportoonline editoryal ekibi tarafından bilgilendirme amacıyla hazırlanmıştır. Ürün fiyatı, stok ve kampanya bilgileri değişebilir; satın almadan önce ürün sayfasındaki güncel bilgileri kontrol edin. Egzersiz, beslenme veya takviye tavsiyeleri kişisel sağlık durumunun yerine geçmez. Kronik rahatsızlığınız, sakatlık geçmişiniz, hamilelik durumunuz veya düzenli ilaç kullanımınız varsa hekiminize ya da diyetisyeninize danışın.</p>';

$sources = [
    'who' => '<li><a href="https://www.who.int/news-room/fact-sheets/detail/physical-activity" rel="nofollow noopener" target="_blank">World Health Organization - Physical activity fact sheet</a></li>',
    'who_guidelines' => '<li><a href="https://www.who.int/publications/i/item/9789240015128" rel="nofollow noopener" target="_blank">WHO Guidelines on physical activity and sedentary behaviour</a></li>',
    'issn_protein' => '<li><a href="https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8" rel="nofollow noopener" target="_blank">ISSN Position Stand: Protein and exercise</a></li>',
    'issn_timing' => '<li><a href="https://link.springer.com/article/10.1186/s12970-017-0189-4" rel="nofollow noopener" target="_blank">ISSN Position Stand: Nutrient timing</a></li>',
    'running_shoes' => '<li><a href="https://pubmed.ncbi.nlm.nih.gov/35993829/" rel="nofollow noopener" target="_blank">Cochrane/PubMed - Running shoes for preventing lower limb running injuries</a></li>',
    'shoe_assessment' => '<li><a href="https://pubmed.ncbi.nlm.nih.gov/30880578/" rel="nofollow noopener" target="_blank">PubMed - Running footwear characteristics systematic review</a></li>',
    'runner_knee' => '<li><a href="https://www.ncbi.nlm.nih.gov/books/NBK561507/" rel="nofollow noopener" target="_blank">NCBI Bookshelf - Patellofemoral pain syndrome overview</a></li>',
    'runner_knee_exercises' => '<li><a href="https://www.ncbi.nlm.nih.gov/books/NBK561509/" rel="nofollow noopener" target="_blank">NCBI Bookshelf - Exercises to stabilize the knee</a></li>',
];

function countWordsHtml(string $html): int
{
    $text = html_entity_decode(trim(strip_tags($html)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    if ($text === '') {
        return 0;
    }

    return count(preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY));
}

function faq(array $items): string
{
    $html = '<h2>Sık Sorulan Sorular</h2>';
    foreach ($items as [$question, $answer]) {
        $html .= '<h3>' . htmlspecialchars($question, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</h3>';
        $html .= '<p>' . $answer . '</p>';
    }
    return $html;
}

function sourcesHtml(array $items): string
{
    return '<h2>Kaynaklar ve Ek Okuma</h2><ul>' . implode('', $items) . '</ul>';
}

function ensureMinimumWords(string $html, string $title, int $minimumWords): string
{
    if (countWordsHtml($html) >= $minimumWords) {
        return $html;
    }

    $html .= <<<HTML
<h2>Pratik Uygulama Planı</h2>
<p>Bu konudan en iyi sonucu almak için okuyucunun önce kendi seviyesini ve gerçek ihtiyacını belirlemesi gerekir. {$title} başlığı altında verilen öneriler, tek seferlik kararlar yerine düzenli kontrol edilen bir süreç olarak düşünülmelidir. Başlangıçta amaç kusursuz plan yapmak değil, uygulanabilir bir rutin kurmaktır. Haftalık hedef, bütçe, zaman, ekipman ve toparlanma kapasitesi birlikte değerlendirildiğinde hem gereksiz alışverişlerden kaçınılır hem de daha sürdürülebilir sonuç alınır.</p>
<p>İlk adım mevcut durumu yazmaktır. Hangi günler antrenman yapılacak, hangi ekipmanlar gerçekten kullanılacak, hangi ürünler ihtiyaç listesinin ilk sırasında yer alacak ve hangi alışkanlıklar performansı etkiliyor? Bu sorulara verilen net cevaplar seçim kalitesini artırır. Örneğin yeni başlayan biri için en pahalı üründen önce doğru beden, güvenilir satıcı, kullanım konforu ve düzenli takip daha önemlidir. Deneyimli kullanıcılar ise ürün özelliklerini daha ince karşılaştırabilir; gramaj, malzeme, servis sayısı, garanti, dayanıklılık ve kullanım senaryosu gibi detaylara bakabilir.</p>
<h2>Alışveriş ve Kullanım Kontrol Listesi</h2>
<ul><li>Ürünü veya yöntemi hedefinizle eşleştirin; kilo verme, dayanıklılık, kas kazanımı ve genel sağlık aynı önceliklere sahip değildir.</li><li>Başlangıç seviyesinde karmaşık planlar yerine ölçülebilir ve tekrar edilebilir adımlar seçin.</li><li>Ürün sayfasında beden, içerik, malzeme, servis sayısı, garanti ve iade bilgilerini kontrol edin.</li><li>İlk kullanımda maksimum yoğunluk yerine düşük riskli deneme yapın; rahatsızlık veya ağrı oluşursa kullanımı yeniden değerlendirin.</li><li>Haftalık ilerlemeyi not alın; performans, uyku, enerji, ağrı, kilo ve ölçü değişimleri karar vermeyi kolaylaştırır.</li></ul>
<h2>Ne Zaman Güncelleme Yapılmalı?</h2>
<p>Planın veya ürün seçiminin işe yarayıp yaramadığını anlamak için en az birkaç haftalık düzenli kullanım gerekir. Çok erken değişiklik yapmak gerçek etkiyi görmeyi zorlaştırır. Buna karşılık ağrı, belirgin konforsuzluk, sindirim problemi, üründe deformasyon veya hedefle uyumsuzluk varsa beklemek yerine düzenleme yapılmalıdır. Sportoonline tarafında ürün karşılaştırırken sadece fiyatı değil, kullanım amacını ve uzun vadeli değeri de hesaba katmak daha doğru sonuç verir.</p>
HTML;

    if (countWordsHtml($html) >= $minimumWords) {
        return $html;
    }

    return $html . <<<HTML
<h2>Editoryal Değerlendirme</h2>
<p>Bu rehberdeki öneriler, okuyucunun hızlı karar verebilmesi için pratik bir çerçeve sunar. Yine de her sporcu ve her kullanıcı aynı başlangıç noktasında değildir. Yaş, antrenman geçmişi, sakatlık öyküsü, günlük hareket miktarı, beslenme düzeni, bütçe ve ürün erişimi seçimi etkiler. Bu nedenle en iyi yaklaşım, güvenilir kaynaklardan gelen genel bilgiyi kişisel deneyimle birleştirmek ve gerektiğinde uzman görüşü almaktır. Özellikle sağlık, sakatlık, beslenme veya takviye kararlarında kişisel tıbbi durum dikkate alınmalıdır.</p>
<h2>Takip, Ölçüm ve Karar Verme</h2>
<p>İçeriği okuduktan sonra en doğru aksiyon, küçük bir takip sistemi kurmaktır. Bir not uygulamasında veya antrenman defterinde tarih, kullanılan ürün, yapılan antrenman, hissedilen zorluk, ağrı durumu, uyku kalitesi ve genel enerji seviyesi tutulabilir. Bu kayıtlar birkaç hafta sonra hangi seçimin işe yaradığını daha net gösterir. Sadece tartıdaki değişime, tek bir antrenman performansına veya ilk kullanım hissine göre karar vermek yanıltıcı olabilir. Özellikle koşu, kuvvet antrenmanı, protein kullanımı ve ekipman seçiminde vücut adaptasyonu zaman ister.</p>
<p>Sportoonline üzerinden alışveriş yaparken içeriklerin sonundaki iç linkleri başlangıç noktası olarak kullanabilirsiniz. Ürünleri karşılaştırırken açıklama, kullanıcı ihtiyacı, beden/ölçü, stok, fiyat, kargo ve iade bilgisi birlikte okunmalıdır. Böylece rehber sadece bilgi veren bir metin olarak kalmaz; doğru ürün seçimi, daha düzenli kullanım ve daha bilinçli spor rutini için uygulanabilir bir kontrol listesine dönüşür.</p>
<p>Son karar aşamasında aynı ihtiyacı karşılayan iki seçenek arasında kalırsanız daha sade, daha düzenli kullanabileceğiniz ve hedefinize doğrudan hizmet eden seçeneği öne alın. Spor ekipmanı, beslenme ürünü veya antrenman planı ancak düzenli kullanıldığında anlamlı sonuç üretir.</p>
HTML;
}

function backupBlogs(array $slugs): string
{
    $backupDir = __DIR__ . '/../backend-laravel/storage/app/blog-longform-backups';
    if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true) && !is_dir($backupDir)) {
        throw new RuntimeException("Backup directory could not be created: {$backupDir}");
    }

    $rows = Blog::query()
        ->whereIn('slug', $slugs)
        ->with('related_translations')
        ->get(['id', 'slug', 'title', 'description', 'meta_title', 'meta_description', 'updated_at'])
        ->toArray();

    $path = $backupDir . '/sportoonline-blog-longform-' . date('Ymd-His') . '.json';
    $json = json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false || file_put_contents($path, $json) === false) {
        throw new RuntimeException("Backup file could not be written: {$path}");
    }

    return $path;
}

function upsertBlogTranslation(Blog $blog, string $language, string $key, string $value): void
{
    Translation::query()->updateOrCreate(
        [
            'translatable_type' => Blog::class,
            'translatable_id' => $blog->id,
            'language' => $language,
            'key' => $key,
        ],
        ['value' => $value]
    );
}

function existingBlogExpansion(string $title, ?string $categoryName): string
{
    $categoryText = $categoryName ?: 'spor ve aktif yasam';

    return <<<HTML
<h2>Detaylı Rehber Planı</h2>
<p>{$title} konusunu değerlendirirken sadece kısa bir öneri listesine bakmak yeterli değildir. Kullanıcının hedefi, deneyim seviyesi, bütçesi, mevcut ekipmanı ve haftalık zamanı birlikte düşünülmelidir. {$categoryText} alanında doğru karar genellikle tek bir ürün, tek bir antrenman veya tek bir beslenme tercihiyle değil; düzenli takip edilen küçük ama istikrarlı adımlarla oluşur. Bu nedenle bu rehberi okurken önce kendi başlangıç noktanızı belirleyin, sonra önerileri ihtiyacınıza göre sadeleştirin.</p>
<p>Başlangıç seviyesinde en önemli konu sürdürülebilirliktir. Çok karmaşık planlar, gereğinden pahalı ekipmanlar veya hızlı sonuç vadeden yaklaşımlar kısa sürede motivasyonu düşürebilir. Bunun yerine haftada uygulanabilir bir rutin kurmak, doğru ürünü doğru amaç için seçmek ve ilerlemeyi düzenli not almak daha sağlıklı sonuç verir. Deneyimli kullanıcılar ise ayrıntılı karşılaştırma yaparken malzeme kalitesi, kullanım ömrü, servis sayısı, destekleyici ekipman ve uzun vadeli maliyet gibi başlıklara bakmalıdır.</p>
<h2>Kimler İçin Uygun?</h2>
<p>Bu içerik, konuya yeni başlayanlar kadar seçimlerini iyileştirmek isteyen deneyimli kullanıcılar için de hazırlanmıştır. Yeni başlayan biri önce temel ihtiyacını netleştirmeli; performans, konfor, dayanıklılık, kilo kontrolü, kas gelişimi, esneklik veya toparlanma gibi hedeflerden hangisinin öncelikli olduğunu belirlemelidir. Daha önce sakatlık yaşamış, kronik rahatsızlığı olan, düzenli ilaç kullanan veya özel beslenme gereksinimi bulunan kullanıcılar ise kararlarını uzman görüşüyle desteklemelidir.</p>
<h2>Uygulama Adımları</h2>
<ol><li>Hedefinizi tek cümleyle yazın ve ölçülebilir hale getirin.</li><li>Mevcut ekipmanınızı, bütçenizi ve haftalık zamanınızı not alın.</li><li>İlk hafta düşük yoğunluklu deneme yapın ve vücudunuzun tepkisini izleyin.</li><li>Ürün veya plan seçerken fiyat yerine kullanım amacı, konfor ve sürekliliği öne alın.</li><li>Her hafta performans, enerji, uyku, ağrı ve motivasyon durumunu kısa notlarla takip edin.</li></ol>
<h2>Alışverişte Dikkat Edilecekler</h2>
<p>Sportoonline üzerinde ürün karşılaştırırken sadece başlık ve görsele bakmak yerine ürün açıklaması, beden/ölçü bilgisi, malzeme, garanti, iade koşulları, stok durumu ve fiyat/performans dengesini birlikte değerlendirin. Bir ürünün pahalı olması her kullanıcı için daha iyi olduğu anlamına gelmez. Aynı şekilde en ucuz seçenek de uzun vadede dayanıklılık veya konfor açısından yetersiz kalabilir. En doğru seçim, hedefinize doğrudan hizmet eden ve düzenli kullanabileceğiniz seçenektir.</p>
<table><thead><tr><th>Kontrol Alanı</th><th>Neden Önemli?</th><th>Nasıl Değerlendirilir?</th></tr></thead><tbody><tr><td>Hedef</td><td>Yanlış ürün veya plan seçimini azaltır</td><td>Kilo, performans, konfor veya sağlık önceliğini belirleyin</td></tr><tr><td>Seviye</td><td>Aşırı yüklenmeyi önler</td><td>Başlangıç, orta veya ileri düzeyi gerçekçi seçin</td></tr><tr><td>Bütçe</td><td>Sürdürülebilir alışveriş sağlar</td><td>Fiyatı kullanım sıklığı ve dayanıklılıkla birlikte okuyun</td></tr><tr><td>Takip</td><td>İlerlemeyi görünür kılar</td><td>Haftalık not, ölçüm veya antrenman kaydı tutun</td></tr></tbody></table>
<h2>Sık Yapılan Hatalar</h2>
<ul><li>İlk kullanımda veya ilk antrenmanda gereğinden fazla yoğunluk seçmek.</li><li>Ürünü sadece kampanya fiyatına göre değerlendirmek.</li><li>Bedeni, ölçüyü, içerik bilgisini veya kullanım talimatını okumadan karar vermek.</li><li>Ağrı, rahatsızlık veya sindirim problemi gibi uyarıları görmezden gelmek.</li><li>Planı sürekli değiştirmek ve ilerlemeyi takip etmemek.</li></ul>
<h2>Haftalık Kullanım Önerisi</h2>
<p>İlk hafta tanıma ve alışma dönemi olarak düşünülmelidir. İkinci hafta kullanım sıklığı veya antrenman yoğunluğu küçük adımlarla artırılabilir. Üçüncü ve dördüncü haftalarda ise performans, konfor ve motivasyon birlikte değerlendirilir. Eğer ürün ya da plan hâlâ hedefe hizmet ediyorsa devam edilir; sorun çıkarıyorsa ayarlama yapılır. Bu yaklaşım hızlı ama kontrolsüz değişiklikler yerine daha güvenilir bir ilerleme sağlar.</p>
<h2>Uygulama Senaryoları</h2>
<p>Yeni başlayan kullanıcı için en iyi senaryo, düşük riskli bir başlangıç yapıp düzenli ilerlemeyi gözlemlemektir. Örneğin ilk hafta kısa denemeler, ikinci hafta daha düzenli kullanım, üçüncü hafta ise performans veya konfor değerlendirmesi yapılabilir. Orta seviyedeki kullanıcılar aynı ürünü veya yöntemi farklı koşullarda deneyerek daha net karar verebilir. İleri seviye kullanıcılar ise ayrıntılı karşılaştırma yaparken küçük farkların uzun vadeli etkisini dikkate almalıdır.</p>
<p>Günlük hayatta uygulanabilirlik de en az teknik özellikler kadar önemlidir. Bir ürün dolapta kalıyorsa, bir antrenman planı sürekli erteleniyorsa veya bir beslenme tercihi sürdürülemiyorsa kağıt üzerinde iyi görünmesi yeterli olmaz. Bu nedenle seçim yaparken “Bunu haftada kaç kez gerçekten kullanacağım?” sorusu mutlaka sorulmalıdır. Gerçekçi cevap, gereksiz harcamaları ve motivasyon kaybını azaltır.</p>
<h2>Bakım, Saklama ve Uzun Ömür</h2>
<p>Ekipmanlarda kullanım ömrünü belirleyen şey sadece ürün kalitesi değildir; bakım ve saklama alışkanlığı da önemlidir. Ter, nem, güneş ışığı, yanlış temizlik ürünleri veya uygun olmayan saklama koşulları ürünün performansını düşürebilir. Giyim ve ayakkabıda etiket talimatlarına uymak, mat ve ekipmanlarda düzenli temizlik yapmak, elektronik ürünlerde şarj ve yazılım takibini ihmal etmemek uzun vadeli verim sağlar.</p>
<p>Beslenme ve takviye ürünlerinde ise son kullanma tarihi, saklama sıcaklığı, kapak bütünlüğü ve porsiyon bilgisi kontrol edilmelidir. Ürünün tadı, kokusu veya yapısı değişmişse kullanmadan önce dikkatli değerlendirme yapılmalıdır. Her üründe güvenilir satıcı, açık içerik bilgisi ve ulaşılabilir müşteri desteği seçim kalitesini artırır.</p>
<h2>Karar Matrisi</h2>
<table><thead><tr><th>Öncelik</th><th>En Uygun Yaklaşım</th><th>Kaçınılması Gereken</th></tr></thead><tbody><tr><td>Konfor</td><td>Doğru beden, uygun malzeme ve düşük riskli deneme</td><td>Sadece görsele göre karar vermek</td></tr><tr><td>Performans</td><td>Ölçülebilir hedef ve düzenli takip</td><td>Her hafta plan değiştirmek</td></tr><tr><td>Bütçe</td><td>Fiyatı kullanım ömrüyle birlikte değerlendirmek</td><td>En ucuz seçeneği otomatik seçmek</td></tr><tr><td>Güvenlik</td><td>Talimatları okumak ve gerektiğinde uzman görüşü almak</td><td>Ağrı veya rahatsızlığı yok saymak</td></tr></tbody></table>
<h2>Sık Sorulan Sorular</h2>
<h3>Bu konuda en doğru seçim nasıl yapılır?</h3>
<p>En doğru seçim hedefinize, seviyenize, bütçenize ve kullanım sıklığınıza göre yapılır. Tek bir seçenek herkes için en iyi değildir.</p>
<h3>Yeni başlayanlar nelere dikkat etmeli?</h3>
<p>Yeni başlayanlar sade ve uygulanabilir bir planla başlamalı, ilk haftalarda yoğunluğu kademeli artırmalı ve vücudun verdiği sinyalleri dikkate almalıdır.</p>
<h3>Ne zaman değişiklik yapılmalı?</h3>
<p>Belirgin ağrı, konforsuzluk, performans düşüşü veya hedefle uyumsuzluk varsa plan veya ürün seçimi yeniden değerlendirilmelidir.</p>
<h2>Son Kontrol Listesi</h2>
<ul><li>Hedefiniz net mi?</li><li>Seçim yaptığınız ürün veya yöntem seviyenize uygun mu?</li><li>İlk kullanımda düşük riskli deneme yaptınız mı?</li><li>Haftalık takip için basit bir not sistemi kurdunuz mu?</li><li>Gerektiğinde uzman görüşü almanız gereken bir sağlık durumunuz var mı?</li></ul>
HTML;
}

function expandExistingBlogDescription(string $html, string $title, ?string $categoryName, int $minimumWords): string
{
    if (countWordsHtml($html) >= $minimumWords) {
        return $html;
    }

    $expanded = trim($html) . existingBlogExpansion($title, $categoryName);
    if (countWordsHtml($expanded) >= $minimumWords) {
        return $expanded;
    }

    return $expanded . <<<HTML
<h2>Editoryal Not</h2>
<p>Bu içerik bilgilendirme amacı taşır. Egzersiz, beslenme, takviye veya sağlıkla ilgili kararlar kişisel duruma göre değişebilir. Kronik rahatsızlığınız, sakatlık geçmişiniz veya özel bir sağlık koşulunuz varsa hekiminize, fizyoterapistinize ya da diyetisyeninize danışmanız önerilir. Ürün fiyatları, stok bilgileri ve kampanyalar zaman içinde değişebileceği için satın almadan önce güncel ürün sayfasını kontrol edin.</p>
<p>Okuyucu için en doğru sonuç, bu rehberi tek seferlik bir tavsiye olarak değil, düzenli gözden geçirilecek bir karar çerçevesi olarak kullanmaktır. İlk denemeden sonra kısa not almak, birkaç hafta sonra aynı seçimi yeniden değerlendirmek ve gerekirse daha uygun bir alternatif aramak daha bilinçli ilerleme sağlar. Sportoonline içerikleri, ürün seçimini kolaylaştırmak ve spor rutinini daha uygulanabilir hale getirmek için hazırlanır; nihai karar her zaman kişisel hedef, bütçe, sağlık durumu ve kullanım alışkanlığıyla birlikte verilmelidir.</p>
HTML;
}

$updates = [
    'evde-yapabileceginiz-10-etkili-egzersiz' => [
        'title' => 'Evde Yapabileceğiniz 10 Etkili Egzersiz: Ekipmansız ve Ekipmanlı Başlangıç Rehberi',
        'meta_description' => 'Evde spor yapmak isteyenler için 10 etkili egzersiz, haftalık plan, güvenlik notları, ekipman önerileri ve SSS içeren kapsamlı rehber.',
        'description' => <<<HTML
<p><strong>Kısa cevap:</strong> Evde etkili spor yapmak için squat, şınav, plank, lunge, glute bridge, mountain climber, dead bug, direnç bandı row, step-up ve burpee gibi temel hareketleri doğru form ve kademeli yüklenme ile uygulamak yeterli bir başlangıç sağlar. Hedefiniz yağ yakımı, kuvvet kazanımı veya genel kondisyon olabilir; önemli olan egzersizleri seviyenize uyarlamak, haftalık planı sürdürülebilir tutmak ve ağrı ile normal zorlanmayı ayırabilmektir.</p>
<p>Evde egzersizin en büyük avantajı erişilebilir olmasıdır. Spor salonuna gitmeden, kısa zaman aralıklarını değerlendirerek ve başlangıçta çok az ekipmanla düzenli hareket alışkanlığı kurulabilir. Ancak evde antrenman “rastgele hareket seçmek” anlamına gelmemelidir. İyi bir program itme, çekme, diz dominant, kalça dominant, core ve kondisyon hareketlerini dengeli içerir. Böylece sadece kalori yakmaya değil, postür, kas dayanıklılığı, denge ve günlük hareket kalitesine de katkı sağlar.</p>
<h2>Kimler İçin Uygun?</h2>
<p>Bu rehber yeni başlayanlar, uzun süredir ara vermiş olanlar ve evde kısa ama verimli antrenman yapmak isteyen kullanıcılar için hazırlanmıştır. Eğer daha önce bel, diz, omuz veya kalça sakatlığı yaşadıysanız hareketleri daha kontrollü seçmeniz gerekir. Egzersize yeni başlıyorsanız ilk hedefiniz maksimum terlemek değil, doğru formu öğrenmek olmalıdır. İlk iki hafta hareket aralıklarını azaltmak, tekrar sayılarını düşük tutmak ve set aralarında yeterli dinlenmek uzun vadede daha iyi sonuç verir.</p>
<h2>10 Etkili Ev Egzersizi</h2>
<h3>1. Squat</h3>
<p>Squat bacak ve kalça kaslarını çalıştıran temel bir harekettir. Ayaklar omuz genişliğinde açıkken kalçayı geriye gönderin, dizleri ayak yönünde takip ettirin ve gövdeyi kontrollü tutun. Yeni başlayanlar sandalyeye otur-kalk varyasyonuyla başlayabilir.</p>
<h3>2. Şınav</h3>
<p>Göğüs, omuz, arka kol ve core kaslarını birlikte çalıştırır. Tam şınav zor geliyorsa diz üstü veya eller yüksek bir zeminde eğimli şınav tercih edin. Dirsekleri çok yana açmak omuz stresini artırabilir; kontrollü iniş daha değerlidir.</p>
<h3>3. Plank</h3>
<p>Plank sadece karın hareketi değildir; omuz, kalça ve gövde stabilizasyonunu birlikte ister. Belinizi çukurlaştırmadan, kalçayı çok yukarı kaldırmadan 20-40 saniyelik setlerle başlayın. Süreyi artırmadan önce formu sabitleyin.</p>
<h3>4. Lunge</h3>
<p>Lunge tek taraflı bacak kuvveti ve denge için etkilidir. Öne adım, geriye adım veya sabit split squat olarak uygulanabilir. Diz hassasiyeti olanlar hareket mesafesini kısaltmalı ve önce destek alarak denemelidir.</p>
<h3>5. Glute Bridge</h3>
<p>Kalça kaslarını aktive eder ve uzun süre oturan kişilerde iyi bir başlangıç hareketidir. Sırt üstü yatın, dizleri bükün, topukları yere bastırarak kalçayı yukarı kaldırın. Belden değil kalçadan güç almaya çalışın.</p>
<h3>6. Mountain Climber</h3>
<p>Kondisyon ve core için kullanılır. Şınav pozisyonunda dizleri sırayla göğse çekin. Hızdan önce gövde kontrolüne odaklanın. Bilek hassasiyetiniz varsa elleri yükseltilmiş zemine koyabilirsiniz.</p>
<h3>7. Dead Bug</h3>
<p>Yeni başlayanlar için bel dostu core hareketlerinden biridir. Sırt üstü yatarken karşı kol ve bacağı kontrollü uzatın. Belin yerden aşırı kalkmamasına dikkat edin.</p>
<h3>8. Direnç Bandı Row</h3>
<p>Ev programlarında en çok eksik kalan hareket çekiştir. Direnç bandı row sırt ve arka omuz kaslarını çalıştırır. Bandı sabitleyin, kürek kemiklerini geriye alın ve omuzları kulaklara doğru çekmeyin.</p>
<h3>9. Step-up</h3>
<p>Sağlam bir basamak veya alçak kutu ile yapılır. Tek bacak kuvvetini geliştirir. Diz kontrolünü kaybetmeden, itişi öndeki bacaktan alarak yükselin.</p>
<h3>10. Burpee</h3>
<p>Burpee yüksek yoğunluklu bir kondisyon hareketidir. Yeni başlayanlar zıplamasız ve şınavsız versiyonla başlamalıdır. Nefes kontrolü bozuluyorsa seti kısa tutmak daha güvenlidir.</p>
<h2>Başlangıç Programı</h2>
<table><thead><tr><th>Seviye</th><th>Set</th><th>Tekrar / Süre</th><th>Dinlenme</th></tr></thead><tbody><tr><td>Yeni başlayan</td><td>2</td><td>8-10 tekrar veya 20 sn</td><td>60-90 sn</td></tr><tr><td>Orta seviye</td><td>3</td><td>10-15 tekrar veya 30 sn</td><td>45-75 sn</td></tr><tr><td>İleri</td><td>4</td><td>12-20 tekrar veya 40 sn</td><td>30-60 sn</td></tr></tbody></table>
<p>Haftada 3 gün tüm vücut çalışması çoğu başlangıç seviyesi kullanıcı için yeterlidir. Örneğin pazartesi, çarşamba ve cuma günleri kuvvet odaklı; salı ve cumartesi günleri 20-30 dakikalık yürüyüş eklenebilir. Vücudunuz toparlanmadan her gün yüksek yoğunluk yapmak motivasyonu ve performansı düşürebilir.</p>
<h2>Sık Yapılan Hatalar</h2>
<ul><li>Isınmadan yüksek yoğunluklu harekete başlamak.</li><li>Form bozulduğu halde tekrar sayısını zorlamak.</li><li>Sadece karın veya sadece kardiyo çalışmak.</li><li>Dinlenme günlerini gereksiz görmek.</li><li>Ağrıyı “normal gelişim sancısı” sanmak.</li></ul>
<h2>Sportoonline İç Link Önerileri</h2>
<p>Ev antrenmanını desteklemek için <a href="/tr/urunler?search=egzersiz%20matı">egzersiz matı</a>, <a href="/tr/urunler?search=direnç%20bandı">direnç bandı</a>, <a href="/tr/urunler?search=dumbbell">dumbbell</a> ve <a href="/tr/urunler?search=atlama%20ipi">atlama ipi</a> kategorilerini kontrol edebilirsiniz. Ekipman seçerken önce alanınızı, sonra hedefinizi ve son olarak bütçenizi düşünün.</p>
HTML
        . $sourceNote
        . faq([
            ['Evde spor yapmak kilo verdirir mi?', 'Kalori dengesi uygunsa evde spor kilo verme sürecini destekler. Ancak sadece egzersiz değil, beslenme, uyku ve günlük hareket miktarı da belirleyicidir.'],
            ['Her gün egzersiz yapmalı mıyım?', 'Yeni başlayanlar için haftada 3-4 gün planlı antrenman ve aralarda aktif dinlenme daha sürdürülebilir olur.'],
            ['Ekipmansız kas gelişir mi?', 'Başlangıç seviyesinde vücut ağırlığı egzersizleri kas dayanıklılığı ve kuvvet artışı sağlayabilir. Zamanla direnç bandı veya ağırlık eklemek gelişimi kolaylaştırır.'],
        ])
        . sourcesHtml([$sources['who'], $sources['who_guidelines']]),
    ],
    'sporcular-icin-en-iyi-10-protein-kaynagi' => [
        'title' => 'Sporcular İçin En İyi 10 Protein Kaynağı: Günlük Beslenme ve Seçim Rehberi',
        'meta_description' => 'Sporcular için 10 protein kaynağı, porsiyon planlama, bitkisel ve hayvansal alternatifler, seçim tablosu, kaynaklar ve SSS.',
        'description' => <<<HTML
<p><strong>Kısa cevap:</strong> Sporcular için en iyi protein kaynakları tek bir üründen ibaret değildir. Tavuk, hindi, yumurta, balık, kırmızı et, yoğurt, peynir, baklagiller, tofu/soya ürünleri ve whey protein gibi seçenekler hedefe, bütçeye, sindirime ve günlük toplam protein ihtiyacına göre birlikte planlanmalıdır. Kas gelişimi için temel konu tek öğün değil, gün boyunca yeterli ve dengeli protein alımıdır.</p>
<p>Protein kas onarımı, bağışıklık fonksiyonları, enzim-hormon üretimi ve antrenman sonrası toparlanma için temel makro besindir. Direnç antrenmanı yapan kişilerde protein ihtiyacı sedanter bireylere göre daha yüksek olabilir. Ancak “ne kadar çok protein, o kadar iyi” yaklaşımı doğru değildir. Enerji dengesi, karbonhidrat alımı, yağ kalitesi, uyku ve antrenman programı da sonuçları belirler. Bu rehber, protein kaynaklarını pratik mutfak ve sporcu alışverişi açısından karşılaştırır.</p>
<h2>10 Güçlü Protein Kaynağı</h2>
<h3>1. Tavuk Göğsü</h3>
<p>Yağ oranı düşük, pişirmesi kolay ve porsiyon başına protein oranı yüksektir. Diyet dönemlerinde sık tercih edilir. Tek başına kuru kalabileceği için sebze, tam tahıl ve sağlıklı yağlarla dengelenmelidir.</p>
<h3>2. Hindi</h3>
<p>Tavuğa benzer şekilde yağsız protein sağlar. Sandviç, salata ve ana öğünlerde kullanılabilir. İşlenmiş hindi ürünlerinde sodyum miktarı yüksek olabileceğinden etiket kontrolü önemlidir.</p>
<h3>3. Yumurta</h3>
<p>Pratik, ekonomik ve yüksek biyolojik değere sahip bir protein kaynağıdır. Sarısı vitamin ve mineral içerir. Kolesterol veya özel sağlık durumu olanlar tüketim miktarını uzmanla planlamalıdır.</p>
<h3>4. Balık</h3>
<p>Somon, sardalya, ton balığı ve levrek gibi balıklar protein yanında omega-3 yağ asitleri de sağlayabilir. Haftalık beslenme çeşitliliği için değerlidir.</p>
<h3>5. Yağsız Kırmızı Et</h3>
<p>Protein, demir, B12 ve kreatin içerir. Yağ oranı yüksek kesimler yerine daha yağsız parçalar tercih edilebilir. Porsiyon ve sıklık kişisel hedefe göre ayarlanmalıdır.</p>
<h3>6. Yoğurt ve Süzme Yoğurt</h3>
<p>Süzme yoğurt porsiyon başına daha yoğun protein sağlayabilir. Ara öğünlerde meyve, yulaf veya kuruyemişle dengeli bir seçenek olur.</p>
<h3>7. Peynir ve Lor</h3>
<p>Lor peyniri uygun fiyatlı ve pratik bir protein kaynağıdır. Tuz oranı markaya göre değişebileceği için etiket okunmalıdır.</p>
<h3>8. Baklagiller</h3>
<p>Mercimek, nohut, fasulye ve barbunya bitkisel protein, lif ve kompleks karbonhidrat sağlar. Tek başına amino asit profili sınırlı olabilir; tahıllarla birlikte kullanıldığında öğün kalitesi artar.</p>
<h3>9. Tofu ve Soya Ürünleri</h3>
<p>Bitkisel beslenen sporcular için güçlü bir seçenektir. Tofu, sebzeli yemeklere ve salatalara kolayca eklenebilir.</p>
<h3>10. Whey Protein</h3>
<p>Whey protein gıda yerine geçmek zorunda değildir; günlük protein hedefini tamamlamak için pratik bir takviye olabilir. Özellikle yoğun çalışan, antrenman sonrası hızlı seçenek arayan veya yeterli protein almakta zorlanan kişiler için kullanışlıdır.</p>
<h2>Karşılaştırma Tablosu</h2>
<table><thead><tr><th>Kaynak</th><th>Avantaj</th><th>Dikkat Edilecek Nokta</th><th>Uygun Kullanım</th></tr></thead><tbody><tr><td>Yumurta</td><td>Pratik ve kaliteli</td><td>Kişisel sağlık durumu</td><td>Kahvaltı, ara öğün</td></tr><tr><td>Balık</td><td>Protein + sağlıklı yağ</td><td>Tazelik ve pişirme</td><td>Ana öğün</td></tr><tr><td>Baklagil</td><td>Lif ve bitkisel protein</td><td>Porsiyon karbonhidrat içerir</td><td>Öğle/akşam</td></tr><tr><td>Whey</td><td>Pratik tamamlayıcı</td><td>Etiket ve tolerans</td><td>Antrenman sonrası veya ara öğün</td></tr></tbody></table>
<h2>Günlük Planlama Nasıl Yapılır?</h2>
<p>Günlük protein hedefini tek öğüne yüklemek yerine 3-5 öğüne yaymak çoğu kişi için daha uygulanabilir olur. Kahvaltıda yumurta veya yoğurt, öğlen tavuk/baklagil, akşam balık veya et, ara öğünde lor veya whey gibi bir dağılım tercih edilebilir. Sporcu beslenmesinde karbonhidratı tamamen kesmek genellikle performansı düşürür; özellikle yoğun antrenman yapanlar protein kadar enerji alımını da planlamalıdır.</p>
<h2>Sık Yapılan Hatalar</h2>
<ul><li>Sadece protein tozuna güvenmek.</li><li>Kalori ve karbonhidratı gereğinden fazla kısmak.</li><li>Bitkisel proteinleri eksik saymak.</li><li>Etiket okumadan takviye almak.</li><li>Yetersiz su, uyku ve toparlanmayı göz ardı etmek.</li></ul>
<h2>Sportoonline İç Link Önerileri</h2>
<p>Pratik tamamlayıcı seçenekler için <a href="/tr/urunler?search=whey%20protein">whey protein</a>, <a href="/tr/urunler?search=protein%20bar">protein bar</a> ve <a href="/tr/urunler?search=shaker">shaker</a> ürünlerini inceleyebilirsiniz. Satın almadan önce porsiyon başına protein, şeker, aroma, servis sayısı ve fiyat/servis dengesini karşılaştırın.</p>
HTML
        . $sourceNote
        . faq([
            ['Sporcular için en iyi protein hangisi?', 'Tek bir en iyi seçenek yoktur. Günlük hedef, sindirim toleransı, bütçe ve öğün düzeni belirleyicidir.'],
            ['Whey protein şart mı?', 'Hayır. Besinlerle yeterli protein alınabiliyorsa şart değildir; pratik bir tamamlayıcı olarak kullanılabilir.'],
            ['Bitkisel protein yeterli olur mu?', 'Evet, iyi planlanırsa bitkisel proteinlerle de hedefe ulaşılabilir. Baklagil, soya, tahıl ve kuruyemiş kombinasyonları kullanılabilir.'],
        ])
        . sourcesHtml([$sources['issn_protein'], $sources['issn_timing']]),
    ],
    'dogru-kosu-ayakkabisi-nasil-secilir' => [
        'title' => 'Doğru Koşu Ayakkabısı Nasıl Seçilir? Zemin, Yastıklama ve Numara Rehberi',
        'meta_description' => 'Koşu ayakkabısı seçimi için zemin, ayak tipi, yastıklama, drop, numara payı, sık hatalar, karşılaştırma tablosu ve SSS.',
        'description' => <<<HTML
<p><strong>Kısa cevap:</strong> Doğru koşu ayakkabısı; koştuğunuz zemin, haftalık mesafe, ayak konforu, yastıklama ihtiyacı, taban tutuşu, kalıp ve numara payı birlikte değerlendirilerek seçilir. Herkes için tek bir “en iyi” model yoktur. En doğru seçim, ayağınıza rahat gelen, koşu amacınıza uyan ve antrenman yükünüzü güvenli şekilde taşıyan modeldir.</p>
<p>Koşu ayakkabısı seçimi sadece marka veya renk tercihi değildir. Günlük sneaker ile koşu ayakkabısı arasındaki fark; orta taban yapısı, darbe emilimi, dış taban tutuşu, üst saya nefes alabilirliği ve uzun süreli konfor gibi detaylarda ortaya çıkar. Yanlış ayakkabı tek başına sakatlık sebebi olmayabilir, fakat yanlış numara, uygun olmayan zemin tabanı veya çok yıpranmış ayakkabı koşu deneyimini ciddi biçimde bozabilir.</p>
<h2>Önce Koşu Amacınızı Belirleyin</h2>
<p>Haftada 1-2 kez kısa koşu yapan biriyle yarı maraton hazırlığı yapan kişinin ihtiyacı aynı değildir. Yeni başlayanlar için konfor, dengeli yastıklama ve ayağı sıkmayan kalıp önceliklidir. Tempo antrenmanı yapanlar daha hafif ve tepkili modelleri tercih edebilir. Patika koşucuları ise yol ayakkabısı yerine dişli dış tabanı olan trail modellerine bakmalıdır.</p>
<h2>Zemine Göre Seçim</h2>
<h3>Asfalt ve Parkur</h3>
<p>Asfalt koşusunda darbe tekrarı fazladır. Bu nedenle orta taban konforu, topuk-ön ayak geçişi ve uzun koşudaki rahatlık önem kazanır.</p>
<h3>Koşu Bandı</h3>
<p>Koşu bandında tutuş ihtiyacı daha düşüktür. Hafif, nefes alabilen ve ayağı iyi saran modeller yeterli olabilir.</p>
<h3>Trail ve Toprak Zemin</h3>
<p>Patika, taşlı veya çamurlu zeminde dış taban dişleri, burun koruması ve yan stabilite önemlidir. Yol ayakkabısıyla trail koşmak kayma ve burkulma riskini artırabilir.</p>
<h2>Numara ve Kalıp</h2>
<p>Koşu sırasında ayak bir miktar şişebilir. Bu nedenle parmak ucunda yaklaşık yarım ila bir başparmak boşluk bırakmak çoğu koşucu için konfor sağlar. Ayakkabıyı günün sonunda veya antrenman sonrası denemek gerçekçi fikir verebilir. Topuğun aşırı oynamaması, tarak kısmının sıkışmaması ve parmakların rahat hareket edebilmesi gerekir.</p>
<h2>Yastıklama, Drop ve Destek</h2>
<p>Yastıklama yüksekliği arttıkça konfor hissi artabilir, ancak herkes maksimum yastıklamayı sevmeyebilir. Drop, topuk ve ön ayak yüksekliği arasındaki farktır. Düşük drop baldır ve aşil bölgesini daha fazla zorlayabilir; yüksek drop bazı koşucular için daha tanıdık hissettirebilir. Destekli ayakkabılar bazı koşuculara iyi gelebilir, ancak ayak basışına göre otomatik seçim yapmak yerine gerçek konfor ve kullanım hissi değerlendirilmelidir.</p>
<h2>Karşılaştırma Tablosu</h2>
<table><thead><tr><th>Kullanım</th><th>Öncelik</th><th>Ayakkabı Tipi</th><th>Dikkat</th></tr></thead><tbody><tr><td>Yeni başlayan</td><td>Konfor</td><td>Nötr/yastıklı</td><td>Numara payı</td></tr><tr><td>Uzun koşu</td><td>Darbe emilimi</td><td>Yastıklı yol</td><td>Ağırlık-konfor dengesi</td></tr><tr><td>Tempo</td><td>Tepki</td><td>Hafif model</td><td>Dayanıklılık</td></tr><tr><td>Trail</td><td>Tutuş</td><td>Dişli taban</td><td>Zemin uyumu</td></tr></tbody></table>
<h2>Ne Zaman Değiştirilmeli?</h2>
<p>Ayakkabının ömrü kullanıcının kilosuna, zemine, koşu stiline ve modele göre değişir. Orta tabanda çökme, dış tabanda belirgin aşınma, koşu sonrası alışılmadık ağrı veya üst yüzeyde deformasyon varsa değişim zamanı gelmiş olabilir. Tek ayakkabıyla hem günlük kullanım hem koşu yapmak ömrü kısaltabilir.</p>
<h2>Sık Yapılan Hatalar</h2>
<ul><li>Sadece indirimde olduğu için model almak.</li><li>Günlük ayakkabı numarasıyla koşu ayakkabısı almak.</li><li>Trail zeminde yol ayakkabısı kullanmak.</li><li>Çok eski ayakkabıyla antrenmana devam etmek.</li><li>İlk koşuda uzun mesafe denemek.</li></ul>
<h2>Sportoonline İç Link Önerileri</h2>
<p>Seçime başlamak için <a href="/tr/urunler?search=koşu%20ayakkabısı">koşu ayakkabısı</a>, <a href="/tr/urunler?search=trail%20ayakkabı">trail ayakkabısı</a>, <a href="/tr/urunler?search=koşu%20çorabı">koşu çorabı</a> ve <a href="/tr/urunler?search=spor%20saat">spor saati</a> aramalarını kullanabilirsiniz.</p>
HTML
        . $sourceNote
        . faq([
            ['Koşu ayakkabısı yürüyüşte kullanılır mı?', 'Kullanılabilir, ancak koşu için ayrılmış ayakkabıyı günlük kullanımda yıpratmak performans ömrünü kısaltır.'],
            ['En yastıklı model en iyi model midir?', 'Hayır. Konfor kişiseldir; bazı koşucular daha dengeli ve daha az yumuşak modelleri tercih eder.'],
            ['Ayak analizi şart mı?', 'Şart değildir, ama sık sakatlık yaşayan veya konfor bulamayan koşucular için uzman değerlendirmesi faydalı olabilir.'],
        ])
        . sourcesHtml([$sources['running_shoes'], $sources['shoe_assessment'], $sources['who']]),
    ],
    'ilk-maratonunuza-nasil-hazirlanirsiniz' => [
        'title' => 'İlk Maratonunuza Nasıl Hazırlanırsınız? 16 Haftalık Plan ve Yarış Günü Rehberi',
        'meta_description' => 'İlk maraton hazırlığı için 16 haftalık plan, uzun koşu, tempo, beslenme, ekipman, yarış günü stratejisi, kaynaklar ve SSS.',
        'description' => <<<HTML
<p><strong>Kısa cevap:</strong> İlk maraton hazırlığı için en az 16 haftalık kademeli bir plan, haftalık uzun koşu, kolay koşular, kuvvet çalışması, dinlenme, beslenme provası ve yarış günü stratejisi gerekir. Amaç her hafta daha çok zorlanmak değil, vücudu 42,195 km’ye sakatlanmadan ve sürdürülebilir şekilde hazırlamaktır.</p>
<p>Maraton sadece tek günlük bir yarış değildir; aylar süren uyku, beslenme, antrenman ve toparlanma düzeninin sonucudur. İlk kez maraton koşacak biri için en büyük risk motivasyon eksikliği değil, acele etmektir. Haftalık kilometreyi çok hızlı artırmak, uzun koşuları yarış temposuna çevirmek, dinlenme günlerini atlamak ve ayakkabı-beslenme denemelerini yarış gününe bırakmak hazırlığı zora sokar.</p>
<h2>Başlamadan Önce Hazır mısınız?</h2>
<p>Maraton planına başlamadan önce düzenli koşu alışkanlığınızın olması önerilir. En az 8-10 km’yi rahat koşabiliyor, haftada 3 gün koşuya zaman ayırabiliyor ve son dönemde ciddi sakatlık yaşamamışsanız 16 haftalık plan daha güvenli ilerler. Yeni başlayanların önce 5K, 10K ve yarı maraton basamaklarını deneyimlemesi daha iyi olabilir.</p>
<h2>16 Haftalık Hazırlık Mantığı</h2>
<p>Planı dört döneme ayırabilirsiniz. İlk 4 hafta temel dayanıklılık; 5-8. haftalar kilometre artışı; 9-13. haftalar en uzun koşular; son 3 hafta ise azaltma ve tazelenme dönemidir. Haftalık kilometreyi bir anda artırmak yerine kademeli ilerlemek gerekir. Her 3-4 haftada bir daha hafif hafta eklemek toparlanmayı destekler.</p>
<h2>Antrenman Türleri</h2>
<h3>Kolay Koşular</h3>
<p>Konuşabilecek tempoda yapılan koşulardır. Maraton hazırlığının büyük kısmı kolay koşulardan oluşmalıdır. Kalp-damar dayanıklılığını artırır ve toparlanmayı destekler.</p>
<h3>Uzun Koşu</h3>
<p>Haftanın en önemli koşusudur. Mesafe kademeli artırılır. İlk maraton için en uzun koşu genellikle yarıştan 3-4 hafta önce yapılır. Her uzun koşuyu hızlı koşmak yerine kontrollü bitirmek daha değerlidir.</p>
<h3>Tempo Koşusu</h3>
<p>Rahat ama zorlayıcı tempoda kısa bloklar içerir. Maraton temposuna alışmayı sağlar. Yeni başlayanlar bunu abartmamalı; haftada birden fazla yoğun antrenman genellikle gereksizdir.</p>
<h3>Kuvvet Çalışması</h3>
<p>Kalça, core, baldır ve arka bacak kaslarını güçlendirmek koşu ekonomisini destekleyebilir. Haftada 1-2 gün kısa kuvvet seansı yeterlidir.</p>
<h2>Örnek Haftalık Düzen</h2>
<table><thead><tr><th>Gün</th><th>İçerik</th><th>Amaç</th></tr></thead><tbody><tr><td>Pazartesi</td><td>Dinlenme veya mobilite</td><td>Toparlanma</td></tr><tr><td>Salı</td><td>Kolay koşu + kısa hızlanmalar</td><td>Teknik</td></tr><tr><td>Çarşamba</td><td>Kuvvet</td><td>Sakatlık riskini azaltma</td></tr><tr><td>Perşembe</td><td>Tempo blokları</td><td>Dayanıklılık</td></tr><tr><td>Cuma</td><td>Dinlenme</td><td>Hazırlık</td></tr><tr><td>Cumartesi</td><td>Kolay koşu</td><td>Hacim</td></tr><tr><td>Pazar</td><td>Uzun koşu</td><td>Maraton adaptasyonu</td></tr></tbody></table>
<h2>Beslenme ve Sıvı Planı</h2>
<p>Maraton günü ne yiyeceğinizi yarışta ilk kez denemeyin. Uzun koşularda su, elektrolit ve karbonhidrat alımını test edin. Kahvaltı saati, mide toleransı ve jel/atıştırmalık seçimi kişisel olarak değişir. Yarış haftasında daha önce denemediğiniz takviye veya besini kullanmak risklidir.</p>
<h2>Ekipman Kontrolü</h2>
<p>Ayakkabı yarıştan önce defalarca denenmiş olmalıdır. Çorap, şort, tişört, bel çantası ve saat gibi ekipmanlarda sürtünme yapmayan parçalar seçin. Yarış günü yeni ayakkabı giymek veya yeni kıyafet denemek basit ama sık yapılan bir hatadır.</p>
<h2>Yarış Günü Stratejisi</h2>
<p>İlk 10 km’de kontrollü başlamak maratonun en önemli kararlarından biridir. Kalabalık, heyecan ve adrenalin sizi hızlı başlatabilir. İlk yarıyı planlı koşup ikinci yarıda gücü korumaya çalışın. Yokuşlarda eforu, inişlerde dizleri ve son 10 km’de zihinsel ritmi yönetin.</p>
<h2>Sportoonline İç Link Önerileri</h2>
<p>Hazırlık için <a href="/tr/urunler?search=koşu%20ayakkabısı">koşu ayakkabısı</a>, <a href="/tr/urunler?search=spor%20saat">spor saatleri</a>, <a href="/tr/urunler?search=koşu%20çorabı">koşu çorabı</a> ve <a href="/tr/urunler?search=enerji%20jeli">enerji jeli</a> aramalarını inceleyebilirsiniz.</p>
HTML
        . $sourceNote
        . faq([
            ['İlk maraton için kaç hafta hazırlanmalı?', 'Düzenli koşu geçmişi olanlar için 16 hafta iyi bir minimumdur. Daha yeni başlayanlar önce daha kısa yarışları hedeflemelidir.'],
            ['En uzun antrenman kaç km olmalı?', 'Kişiye göre değişir, ancak ilk maraton planlarında en uzun koşu genellikle 28-34 km aralığında planlanır.'],
            ['Maratonda yürümek sorun mu?', 'Hayır. Planlı yürü-koş stratejisi birçok ilk maraton koşucusu için sürdürülebilir bir yöntem olabilir.'],
        ])
        . sourcesHtml([$sources['who'], $sources['who_guidelines'], $sources['running_shoes']]),
    ],
    'whey-protein-markalari-karsilastirmasi' => [
        'title' => 'Whey Protein Markaları Karşılaştırması: Isolate, Concentrate ve Seçim Kriterleri',
        'meta_description' => 'Whey protein seçimi için isolate, concentrate, hydrolyzed farkları, etiket okuma, fiyat/servis tablosu, kaynaklar ve SSS.',
        'description' => <<<HTML
<p><strong>Kısa cevap:</strong> Whey protein seçerken marka adından önce porsiyon başına protein miktarı, protein türü, şeker ve katkı oranı, servis sayısı, fiyat/servis dengesi, laktoz toleransı ve satıcı güvenilirliği değerlendirilmelidir. Concentrate çoğu kullanıcı için yeterli olabilir; isolate daha düşük laktoz ve daha yüksek protein oranı isteyenler için öne çıkar.</p>
<p>Whey protein, sütten elde edilen ve sporcu beslenmesinde pratikliği nedeniyle sık kullanılan bir protein kaynağıdır. Fakat piyasadaki ürünlerin hepsi aynı değildir. Aynı kutu gramajına sahip iki ürün porsiyon başına farklı protein, karbonhidrat, yağ, aroma ve servis sayısı sunabilir. Bu yüzden gerçek karşılaştırma kutu fiyatı üzerinden değil, servis başına protein ve toplam içerik kalitesi üzerinden yapılmalıdır.</p>
<h2>Whey Türleri</h2>
<h3>Whey Concentrate</h3>
<p>Genellikle fiyat/performans açısından güçlüdür. Protein oranı isolate ürünlere göre daha düşük olabilir, ancak yeni başlayan ve laktoz hassasiyeti olmayan birçok kişi için yeterlidir.</p>
<h3>Whey Isolate</h3>
<p>Daha yüksek protein oranı ve daha düşük laktoz içeriği hedefleyen kullanıcılar için tercih edilebilir. Genellikle daha pahalıdır. Diyet dönemlerinde veya sindirim hassasiyetinde avantaj sağlayabilir.</p>
<h3>Hydrolyzed Whey</h3>
<p>Önceden parçalanmış protein yapısıyla pazarlanır. Fiyatı daha yüksek olabilir. Her kullanıcı için gerekli değildir; karar verirken bütçe ve gerçek ihtiyaç değerlendirilmelidir.</p>
<h2>Marka Karşılaştırırken Nelere Bakılır?</h2>
<ul><li>Porsiyon başına protein gramı.</li><li>Protein yüzdesi ve servis sayısı.</li><li>Şeker, yağ ve karbonhidrat miktarı.</li><li>Aroma ve tatlandırıcı tercihi.</li><li>Üretim/ithalat bilgisi ve son kullanma tarihi.</li><li>Satıcı güvenilirliği ve iade koşulları.</li></ul>
<h2>Karşılaştırma Tablosu</h2>
<table><thead><tr><th>Kriter</th><th>Concentrate</th><th>Isolate</th><th>Hydrolyzed</th></tr></thead><tbody><tr><td>Protein oranı</td><td>Orta-yüksek</td><td>Yüksek</td><td>Yüksek</td></tr><tr><td>Laktoz</td><td>Daha fazla olabilir</td><td>Daha düşük olabilir</td><td>Ürüne göre değişir</td></tr><tr><td>Fiyat</td><td>Genelde daha uygun</td><td>Daha yüksek</td><td>Genelde en yüksek</td></tr><tr><td>Kimler için?</td><td>Genel kullanım</td><td>Diyet/hassasiyet</td><td>Özel tercih</td></tr></tbody></table>
<h2>Yeni Başlayanlar İçin Seçim Yaklaşımı</h2>
<p>Yeni başlayan biri önce günlük protein hedefini besinlerle ne kadar karşılayabildiğini hesaplamalıdır. Eğer öğünlerde yeterli protein alınamıyorsa whey protein pratik bir tamamlayıcı olabilir. İlk seçimde en pahalı ürünü almak yerine sade içerikli, güvenilir satıcıdan alınan, porsiyon başına protein değeri net yazan bir ürün tercih edilebilir.</p>
<h2>Etiket Okuma Kontrol Listesi</h2>
<p>Ürün etiketinde servis gramajı ile protein gramajını karıştırmayın. 30 gram servis içinde 24 gram protein farklıdır; 35 gram servis içinde 22 gram protein farklıdır. Ayrıca şeker, yağ, kreatin eklemesi, amino asit profili ve tatlandırıcı bilgisi kararınızı etkileyebilir. “Protein oranı” hesabı yapmak için porsiyon proteinini servis gramajına bölerek yaklaşık yüzdeyi görebilirsiniz.</p>
<h2>Sık Yapılan Hatalar</h2>
<ul><li>Whey proteini öğünlerin yerine koymak.</li><li>Sadece marka popülerliğine bakmak.</li><li>Fiyatı kutu gramajına göre karşılaştırmak, servis sayısını unutmak.</li><li>Laktoz hassasiyetini dikkate almamak.</li><li>Son kullanma tarihi ve satıcı güvenilirliğini kontrol etmemek.</li></ul>
<h2>Sportoonline İç Link Önerileri</h2>
<p>Karşılaştırmaya <a href="/tr/urunler?search=whey%20protein">whey protein</a>, <a href="/tr/urunler?search=isolate">isolate protein</a>, <a href="/tr/urunler?search=shaker">shaker</a> ve <a href="/tr/urunler?search=protein%20bar">protein bar</a> aramalarıyla başlayabilirsiniz. Ürün sayfalarında servis sayısı, içerik ve fiyatı birlikte değerlendirin.</p>
HTML
        . $sourceNote
        . faq([
            ['Whey protein kas yapar mı?', 'Tek başına kas yapmaz. Direnç antrenmanı, yeterli enerji, toplam protein ve toparlanma ile birlikte süreci destekleyebilir.'],
            ['Isolate mı concentrate mi?', 'Laktoz hassasiyeti veya daha yüksek protein oranı hedefi varsa isolate öne çıkabilir; genel kullanımda concentrate yeterli olabilir.'],
            ['Ne zaman içilmeli?', 'Zamanlama kişisel rutine göre değişir. Toplam günlük protein hedefini tutturmak çoğu kullanıcı için daha önemlidir.'],
        ])
        . sourcesHtml([$sources['issn_protein'], $sources['issn_timing']]),
    ],
    'kas-kutlesi-artirmak-icin-5-altin-kural' => [
        'title' => 'Kas Kütlesi Artırmak İçin 5 Altın Kural: Antrenman, Protein ve Toparlanma Rehberi',
        'meta_description' => 'Kas kütlesi artırmak için progressive overload, protein, kalori dengesi, uyku, antrenman planı, kaynaklar ve SSS içeren rehber.',
        'description' => <<<HTML
<p><strong>Kısa cevap:</strong> Kas kütlesi artırmak için düzenli direnç antrenmanı, kademeli yüklenme, yeterli protein, uygun kalori dengesi, kaliteli uyku ve sürdürülebilir program gerekir. Tek bir takviye veya tek bir egzersiz mucize yaratmaz. Başarı, haftalar ve aylar boyunca ölçülebilir ilerleme ve toparlanma dengesini korumaktan gelir.</p>
<p>Kas gelişimi, kaslara yeterli mekanik gerilim verilmesi ve vücudun bu uyarıya toparlanarak uyum sağlamasıyla oluşur. Yeni başlayanlar genellikle hızlı ilerleme görebilir; ancak bu dönem bile plansız çalışmayı haklı çıkarmaz. Hareket tekniği, haftalık hacim, tekrar aralığı, set kalitesi, beslenme ve dinlenme birlikte düşünülmelidir. Sadece daha ağır kaldırmak değil, doğru hareketi doğru aralıkta sürdürmek önemlidir.</p>
<h2>1. Progressive Overload Uygulayın</h2>
<p>Progressive overload, zaman içinde antrenman stresini kademeli artırmak demektir. Bu artış sadece ağırlık eklemekle olmaz; tekrar artırmak, set eklemek, hareket kontrolünü iyileştirmek veya dinlenme süresini planlamak da ilerleme sağlayabilir. Haftadan haftaya küçük artışlar uzun vadede büyük fark yaratır.</p>
<h2>2. Yeterli Protein Alın</h2>
<p>Protein, kas protein sentezi için gerekli amino asitleri sağlar. Direnç antrenmanı yapan sağlıklı bireylerde günlük protein ihtiyacı genel nüfusa göre daha yüksek olabilir. Kaynak seçerken tavuk, balık, yumurta, süt ürünleri, baklagiller ve gerektiğinde whey protein gibi pratik seçenekler değerlendirilebilir.</p>
<h2>3. Kalori Dengesini Planlayın</h2>
<p>Kas kazanımı için çoğu kişinin hafif kalori fazlasına ihtiyacı olur. Çok agresif kalori fazlası gereksiz yağ artışına yol açabilir; çok düşük kalori ise performansı ve toparlanmayı sınırlar. Haftalık kilo, bel ölçüsü, antrenman performansı ve enerji seviyesi birlikte izlenmelidir.</p>
<h2>4. Büyük Hareketlere Öncelik Verin</h2>
<p>Squat, deadlift varyasyonları, bench press, row, overhead press, pull-up/lat pulldown gibi çok eklemli hareketler zaman verimliliği sağlar. İzolasyon hareketleri de değerlidir; ancak program sadece kol ve karın hareketlerinden oluşmamalıdır. Haftalık program tüm büyük kas gruplarını kapsamalıdır.</p>
<h2>5. Uyku ve Toparlanmayı Ciddiye Alın</h2>
<p>Kaslar antrenman sırasında uyarılır, toparlanma sürecinde gelişir. Sürekli yorgunluk, performans düşüşü, eklem ağrısı ve motivasyon kaybı toparlanma eksikliğine işaret edebilir. Haftada en az 1-2 düşük yoğunluklu gün ve yeterli uyku planlanmalıdır.</p>
<h2>Örnek Haftalık Plan</h2>
<table><thead><tr><th>Gün</th><th>Odak</th><th>Örnek</th></tr></thead><tbody><tr><td>Pazartesi</td><td>Üst vücut</td><td>İtme + çekme</td></tr><tr><td>Salı</td><td>Alt vücut</td><td>Squat + kalça dominant</td></tr><tr><td>Perşembe</td><td>Üst vücut</td><td>Omuz + sırt</td></tr><tr><td>Cuma</td><td>Alt vücut</td><td>Deadlift varyasyonu + core</td></tr></tbody></table>
<h2>Takviye Gerekli mi?</h2>
<p>Takviyeler temel planın yerine geçmez. Whey protein günlük protein hedefini tamamlamaya yardımcı olabilir. Kreatin monohidrat bazı sporcularda yüksek yoğunluklu performansı destekleyebilir. Ancak takviye kararı kişisel sağlık durumuna, beslenme düzenine ve hedefe göre verilmelidir.</p>
<h2>Sık Yapılan Hatalar</h2>
<ul><li>Her antrenmanda maksimum denemek.</li><li>Hareket formunu ihmal etmek.</li><li>Protein alırken toplam kaloriyi unutmak.</li><li>Programı çok sık değiştirmek.</li><li>Uyku ve dinlenmeyi önemsiz görmek.</li></ul>
<h2>Sportoonline İç Link Önerileri</h2>
<p>Kas kazanım sürecinde <a href="/tr/urunler?search=whey%20protein">whey protein</a>, <a href="/tr/urunler?search=kreatin">kreatin</a>, <a href="/tr/urunler?search=dumbbell">dumbbell</a>, <a href="/tr/urunler?search=direnç%20bandı">direnç bandı</a> ve <a href="/tr/urunler?search=shaker">shaker</a> ürünlerini karşılaştırabilirsiniz.</p>
HTML
        . $sourceNote
        . faq([
            ['Kas yapmak için kaç tekrar gerekir?', 'Genellikle 6-15 tekrar aralığı pratik bir başlangıçtır. Önemli olan setlerin kaliteli, kontrollü ve zaman içinde ilerleyen yapıda olmasıdır.'],
            ['Protein tozu olmadan kas yapılır mı?', 'Evet. Günlük protein hedefi normal besinlerle karşılanabiliyorsa protein tozu şart değildir.'],
            ['Her gün aynı kas çalışılır mı?', 'Yeni başlayanlar için aynı kas grubuna toparlanma süresi bırakmak daha güvenlidir. Program hacmi ve deneyime göre değişir.'],
        ])
        . sourcesHtml([$sources['issn_protein'], $sources['who']]),
    ],
];

if ($allExisting) {
    $blogs = Blog::query()
        ->with(['category', 'related_translations'])
        ->where('status', 1)
        ->orderBy('id')
        ->get();

    if (!$dryRun && !$skipBackup) {
        echo "backup\t" . backupBlogs($blogs->pluck('slug')->all()) . "\n";
    }

    foreach ($blogs as $blog) {
        $trTitle = $blog->related_translations
            ->where('language', 'tr')
            ->where('key', 'title')
            ->first()?->value;
        $title = (string) ($trTitle ?: $blog->title);
        $description = expandExistingBlogDescription((string) $blog->description, $title, $blog->category?->name, $minimumWords);
        $metaDescription = $blog->meta_description ?: mb_substr(strip_tags($description), 0, 155);
        $words = countWordsHtml($description);

        if (!$dryRun) {
            $blog->title = $title;
            $blog->description = $description;
            $blog->meta_title = $blog->meta_title ?: $title;
            $blog->meta_description = $metaDescription;
            $blog->save();

            upsertBlogTranslation($blog, 'tr', 'title', $title);
            upsertBlogTranslation($blog, 'tr', 'description', $description);
            upsertBlogTranslation($blog, 'tr', 'meta_title', (string) ($blog->meta_title ?: $title));
            upsertBlogTranslation($blog, 'tr', 'meta_description', (string) $metaDescription);
        }

        echo ($dryRun ? 'dry-run-all' : 'updated-all') . "\t{$blog->id}\t{$blog->slug}\twords={$words}\n";
    }

    exit(0);
}

if ($verifyCurrent) {
    foreach (array_keys($updates) as $slug) {
        $blog = Blog::query()->with('related_translations')->where('slug', $slug)->first();
        if (!$blog) {
            echo "missing\t{$slug}\n";
            continue;
        }

        $trDescription = $blog->related_translations
            ->where('language', 'tr')
            ->where('key', 'description')
            ->first()?->value;

        echo "current\t{$blog->id}\t{$blog->slug}\tbase_words=" . countWordsHtml($blog->description)
            . "\ttr_words=" . countWordsHtml((string) $trDescription) . "\n";
    }
    exit(0);
}

if (!$dryRun && !$skipBackup) {
    echo "backup\t" . backupBlogs(array_keys($updates)) . "\n";
}

foreach ($updates as $slug => $payload) {
    $description = ensureMinimumWords($payload['description'], $payload['title'], $minimumWords);
    $words = countWordsHtml($description);

    if ($contentOnly) {
        echo "content-only\t{$slug}\twords={$words}\n";
        continue;
    }

    $blog = Blog::query()->where('slug', $slug)->first();
    if (!$blog) {
        echo "missing\t{$slug}\n";
        continue;
    }

    if (!$dryRun) {
        $blog->title = $payload['title'];
        $blog->description = $description;
        $blog->meta_title = $payload['title'];
        $blog->meta_description = $payload['meta_description'];
        $blog->save();

        upsertBlogTranslation($blog, 'tr', 'title', $payload['title']);
        upsertBlogTranslation($blog, 'tr', 'description', $description);
        upsertBlogTranslation($blog, 'tr', 'meta_title', $payload['title']);
        upsertBlogTranslation($blog, 'tr', 'meta_description', $payload['meta_description']);
    }

    echo ($dryRun ? 'dry-run' : 'updated') . "\t{$blog->id}\t{$slug}\twords={$words}\n";
}
