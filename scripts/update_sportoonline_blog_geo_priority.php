<?php

declare(strict_types=1);

use App\Models\Translation;
use Modules\Blog\app\Models\Blog;

require __DIR__ . '/../backend-laravel/vendor/autoload.php';

$app = require __DIR__ . '/../backend-laravel/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$dryRun = in_array('--dry-run', $argv, true);
$verify = in_array('--verify', $argv, true);

function countWordsHtml(string $html): int
{
    $text = html_entity_decode(trim(strip_tags($html)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    if ($text === '') {
        return 0;
    }

    return count(preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY));
}

function removeMarkedBlocks(string $html): string
{
    $html = preg_replace('/<!-- geo-short-answer-start -->.*?<!-- geo-short-answer-end -->/s', '', $html) ?? $html;
    return preg_replace('/<!-- geo-priority-start -->.*?<!-- geo-priority-end -->/s', '', $html) ?? $html;
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

function backupBlogs(array $slugs): string
{
    $backupDir = __DIR__ . '/../backend-laravel/storage/app/blog-geo-priority-backups';
    if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true) && !is_dir($backupDir)) {
        throw new RuntimeException("Backup directory could not be created: {$backupDir}");
    }

    $rows = Blog::query()
        ->whereIn('slug', $slugs)
        ->with('related_translations')
        ->get(['id', 'slug', 'title', 'description', 'meta_title', 'meta_description', 'updated_at'])
        ->toArray();

    $path = $backupDir . '/sportoonline-blog-geo-priority-' . date('Ymd-His') . '.json';
    $json = json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false || file_put_contents($path, $json) === false) {
        throw new RuntimeException("Backup file could not be written: {$path}");
    }

    return $path;
}

function listItems(array $items): string
{
    return implode('', array_map(static fn (string $item): string => "<li>{$item}</li>", $items));
}

$sourceLinks = [
    'who_activity' => '<a href="https://www.who.int/news-room/fact-sheets/detail/physical-activity" rel="nofollow noopener" target="_blank">WHO - Physical activity fact sheet</a>',
    'who_guidelines' => '<a href="https://www.who.int/publications/i/item/9789240015128" rel="nofollow noopener" target="_blank">WHO - Physical activity and sedentary behaviour guidelines</a>',
    'issn_protein' => '<a href="https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8" rel="nofollow noopener" target="_blank">ISSN - Protein and exercise position stand</a>',
    'issn_timing' => '<a href="https://link.springer.com/article/10.1186/s12970-017-0189-4" rel="nofollow noopener" target="_blank">ISSN - Nutrient timing position stand</a>',
    'running_shoes' => '<a href="https://pubmed.ncbi.nlm.nih.gov/35993829/" rel="nofollow noopener" target="_blank">PubMed - Running shoes and injury prevention review</a>',
    'footwear_review' => '<a href="https://pubmed.ncbi.nlm.nih.gov/30880578/" rel="nofollow noopener" target="_blank">PubMed - Running footwear characteristics review</a>',
    'runner_knee' => '<a href="https://www.ncbi.nlm.nih.gov/sites/books/NBK557657/" rel="nofollow noopener" target="_blank">NCBI Bookshelf - Patellofemoral syndrome</a>',
    'nps_essentials' => '<a href="https://www.nps.gov/articles/10essentials.htm" rel="nofollow noopener" target="_blank">National Park Service - Ten Essentials</a>',
    'nhtsa_bike' => '<a href="https://www.nhtsa.gov/Bicycles" rel="nofollow noopener" target="_blank">NHTSA - Bicycle safety</a>',
    'nhtsa_helmet' => '<a href="https://www.nhtsa.gov/document/bike-safety-fitting-bicycle-helmet" rel="nofollow noopener" target="_blank">NHTSA - Fitting a bicycle helmet</a>',
    'redcross_swim' => '<a href="https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/water-safety/swim-safety.html" rel="nofollow noopener" target="_blank">American Red Cross - Swimming safety</a>',
    'nccih_yoga' => '<a href="https://www.nccih.nih.gov/health/yoga-what-you-need-to-know" rel="nofollow noopener" target="_blank">NCCIH - Yoga: what you need to know</a>',
    'cdc_weight' => '<a href="https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html" rel="nofollow noopener" target="_blank">CDC - Losing weight</a>',
    'nih_weight' => '<a href="https://www.niddk.nih.gov/health-information/weight-management" rel="nofollow noopener" target="_blank">NIDDK - Weight management</a>',
    'aha_target_hr' => '<a href="https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates" rel="nofollow noopener" target="_blank">American Heart Association - Target heart rates</a>',
];

$enhancements = [
    'evde-yapabileceginiz-10-etkili-egzersiz' => [
        'short' => 'Evde spor için en iyi başlangıç, tüm vücudu çalıştıran temel hareketleri haftada 3 gün kontrollü uygulamaktır. Squat, şınav, plank, lunge ve kalça hareketlerini doğru form, kısa setler ve yeterli dinlenmeyle birleştirirseniz ekipmansız bile düzenli kondisyon ve kuvvet gelişimi sağlayabilirsiniz.',
        'links' => ['<a href="/tr/urunler?search=egzersiz%20matı">egzersiz matı</a>', '<a href="/tr/urunler?search=direnç%20bandı">direnç bandı</a>', '<a href="/tr/urunler?search=dumbbell">dumbbell</a>', '<a href="/tr/urunler?search=atlama%20ipi">atlama ipi</a>'],
        'sources' => ['who_activity', 'who_guidelines', 'aha_target_hr'],
    ],
    'kas-kutlesi-artirmak-icin-5-altin-kural' => [
        'short' => 'Kas kütlesi artırmak için temel denklem; düzenli direnç antrenmanı, kademeli yüklenme, yeterli protein, uygun kalori dengesi ve toparlanmadır. Programı sık değiştirmek yerine hareket tekniğini, haftalık hacmi ve uyku düzenini takip etmek uzun vadede daha güvenilir sonuç verir.',
        'links' => ['<a href="/tr/urunler?search=whey%20protein">whey protein</a>', '<a href="/tr/urunler?search=kreatin">kreatin</a>', '<a href="/tr/urunler?search=dumbbell">dumbbell</a>', '<a href="/tr/urunler?search=shaker">shaker</a>'],
        'sources' => ['issn_protein', 'issn_timing', 'who_activity'],
    ],
    'sporcular-icin-en-iyi-10-protein-kaynagi' => [
        'short' => 'Sporcular için iyi protein kaynağı; sadece yüksek protein içermekle değil, sindirim toleransı, öğün pratikliği, bütçe ve toplam beslenme düzeniyle değerlendirilmelidir. Tavuk, balık, yumurta, süt ürünleri, baklagiller ve gerektiğinde whey protein birlikte planlandığında daha dengeli sonuç verir.',
        'links' => ['<a href="/tr/urunler?search=whey%20protein">whey protein</a>', '<a href="/tr/urunler?search=protein%20bar">protein bar</a>', '<a href="/tr/urunler?search=shaker">shaker</a>'],
        'sources' => ['issn_protein', 'issn_timing', 'who_activity'],
    ],
    'antrenman-oncesi-ve-sonrasi-ne-yemeli' => [
        'short' => 'Antrenman öncesi öğün enerji ve mide konforu sağlamalı, antrenman sonrası öğün ise protein, karbonhidrat ve sıvı dengesini desteklemelidir. En iyi zamanlama kişisel toleransa bağlıdır; önemli olan gün toplamında yeterli enerji ve protein alımını düzenli sürdürebilmektir.',
        'links' => ['<a href="/tr/urunler?search=protein%20bar">protein bar</a>', '<a href="/tr/urunler?search=whey%20protein">whey protein</a>', '<a href="/tr/urunler?search=shaker">shaker</a>', '<a href="/tr/urunler?search=enerji%20jeli">enerji jeli</a>'],
        'sources' => ['issn_timing', 'issn_protein', 'who_activity'],
    ],
    'ilk-maratonunuza-nasil-hazirlanirsiniz' => [
        'short' => 'İlk maraton hazırlığında başarı, hızlı koşmaktan çok planı sakatlanmadan tamamlamaya bağlıdır. En az 16 haftalık kademeli antrenman, uzun koşu provası, beslenme denemesi, uygun ayakkabı ve yarış günü tempo disiplini birlikte planlandığında 42,195 km daha yönetilebilir hale gelir.',
        'links' => ['<a href="/tr/urunler?search=koşu%20ayakkabısı">koşu ayakkabısı</a>', '<a href="/tr/urunler?search=spor%20saat">spor saati</a>', '<a href="/tr/urunler?search=koşu%20çorabı">koşu çorabı</a>', '<a href="/tr/urunler?search=enerji%20jeli">enerji jeli</a>'],
        'sources' => ['who_activity', 'who_guidelines', 'running_shoes', 'issn_timing'],
        'extra' => '<h2>İlk Maraton İçin Son 4 Hafta Stratejisi</h2><p>Yarışa son 4 hafta kala amaç formu artırmak değil, kazanılan formu koruyarak yorgunluğu azaltmaktır. En uzun koşudan sonra mesafe kademeli düşürülmeli, yarış temposu kısa bloklarla hatırlatılmalı ve uyku düzeni önceliklendirilmelidir. Yarış haftasında yeni ayakkabı, yeni jel, yeni kıyafet veya denenmemiş kahvaltı kullanılmamalıdır.</p>',
    ],
    'dogru-kosu-ayakkabisi-nasil-secilir' => [
        'short' => 'Doğru koşu ayakkabısı, ayağınıza rahat oturan, koştuğunuz zemine uyan ve haftalık mesafenizi güvenli taşıyan modeldir. Marka veya renk yerine kalıp, numara payı, yastıklama, dış taban tutuşu ve kullanım amacı birlikte değerlendirilmelidir.',
        'links' => ['<a href="/tr/urunler?search=koşu%20ayakkabısı">koşu ayakkabısı</a>', '<a href="/tr/urunler?search=trail%20ayakkabı">trail ayakkabısı</a>', '<a href="/tr/urunler?search=koşu%20çorabı">koşu çorabı</a>'],
        'sources' => ['running_shoes', 'footwear_review', 'runner_knee'],
    ],
    'trekking-icin-ekipman-listesi' => [
        'short' => 'Trekking ekipmanı seçerken önce güvenlik, hava koşulu ve rota süresi düşünülmelidir. Çanta, su, katmanlı giyim, harita/GPS, ilk yardım, aydınlatma ve enerji sağlayan atıştırmalıklar temel listededir. Hafiflik önemlidir; ancak temel güvenlik ekipmanlarından vazgeçilmemelidir.',
        'links' => ['<a href="/tr/urunler?search=trekking%20çantası">trekking çantası</a>', '<a href="/tr/urunler?search=outdoor%20ayakkabı">outdoor ayakkabı</a>', '<a href="/tr/urunler?search=termos">termos</a>', '<a href="/tr/urunler?search=kafa%20lambası">kafa lambası</a>'],
        'sources' => ['nps_essentials', 'who_activity', 'redcross_swim'],
    ],
    'kamp-cadiri-secim-rehberi' => [
        'short' => 'Kamp çadırı seçerken kişi kapasitesi, mevsim uygunluğu, su geçirmezlik, kurulum kolaylığı ve taşıma ağırlığı birlikte değerlendirilmelidir. Yaz kampı, trekking kampı ve aile kampı aynı çadırı gerektirmez; rota, hava riski ve konfor beklentisi seçimi belirler.',
        'links' => ['<a href="/tr/urunler?search=kamp%20çadırı">kamp çadırı</a>', '<a href="/tr/urunler?search=uyku%20tulumu">uyku tulumu</a>', '<a href="/tr/urunler?search=mat">kamp matı</a>', '<a href="/tr/urunler?search=kamp%20ocağı">kamp ocağı</a>'],
        'sources' => ['nps_essentials', 'who_activity', 'redcross_swim'],
    ],
    'yol-bisikleti-mi-dag-bisikleti-mi' => [
        'short' => 'Yol bisikleti hız ve asfalt performansı için, dağ bisikleti ise bozuk zemin ve arazi kontrolü için daha uygundur. Seçim yaparken sürüş zemini, güvenlik ekipmanı, kadro geometrisi, lastik yapısı ve gerçek kullanım sıklığı birlikte değerlendirilmelidir.',
        'links' => ['<a href="/tr/urunler?search=bisiklet%20kaskı">bisiklet kaskı</a>', '<a href="/tr/urunler?search=bisiklet%20eldiveni">bisiklet eldiveni</a>', '<a href="/tr/urunler?search=bisiklet%20aydınlatma">bisiklet aydınlatma</a>'],
        'sources' => ['nhtsa_bike', 'nhtsa_helmet', 'who_activity'],
    ],
    'yeni-baslayanlar-icin-yoga-5-temel-poz' => [
        'short' => 'Yoga başlangıcında hedef zor pozlar yapmak değil, nefes, denge, hareket açıklığı ve beden farkındalığını güvenli biçimde geliştirmektir. Dağ pozu, çocuk pozu, aşağı bakan köpek, savaşçı ve ağaç pozu kontrollü uygulandığında iyi bir temel oluşturur.',
        'links' => ['<a href="/tr/urunler?search=yoga%20matı">yoga matı</a>', '<a href="/tr/urunler?search=pilates%20topu">pilates topu</a>', '<a href="/tr/urunler?search=esneme%20bandı">esneme bandı</a>'],
        'sources' => ['nccih_yoga', 'who_activity', 'who_guidelines'],
    ],
    '2024-en-iyi-akilli-saatler-karsilastirma' => [
        'short' => 'Spor için akıllı saat seçerken ekran, pil ömrü, GPS doğruluğu, kalp atış takibi, antrenman modları ve telefon uyumluluğu birlikte değerlendirilmelidir. Her kullanıcıya tek model uymaz; koşu, fitness, outdoor ve günlük kullanım ihtiyaçları farklı özellikleri öne çıkarır.',
        'links' => ['<a href="/tr/urunler?search=spor%20saat">spor saati</a>', '<a href="/tr/urunler?search=akıllı%20saat">akıllı saat</a>', '<a href="/tr/urunler?search=koşu%20ekipmanı">koşu ekipmanı</a>'],
        'sources' => ['aha_target_hr', 'who_activity', 'who_guidelines'],
    ],
    'whey-protein-markalari-karsilastirmasi' => [
        'short' => 'Whey protein seçerken marka adından önce servis başına protein, protein türü, şeker miktarı, laktoz toleransı ve fiyat/servis dengesi incelenmelidir. Concentrate genel kullanım için yeterli olabilir; isolate daha düşük laktoz ve daha yüksek protein oranı isteyenler için uygundur.',
        'links' => ['<a href="/tr/urunler?search=whey%20protein">whey protein</a>', '<a href="/tr/urunler?search=isolate">isolate protein</a>', '<a href="/tr/urunler?search=shaker">shaker</a>'],
        'sources' => ['issn_protein', 'issn_timing', 'who_activity'],
    ],
    '100-kilo-veren-adam-ahmetin-hikayesi' => [
        'short' => 'Büyük kilo kayıplarında sürdürülebilir başarı, hızlı diyetlerden çok davranış değişikliği, düzenli hareket, gerçekçi hedefler ve profesyonel destekle ilişkilidir. İlham veren hikayeler motive edebilir; ancak herkesin sağlık durumu ve başlangıç noktası farklı olduğu için plan kişiselleştirilmelidir.',
        'links' => ['<a href="/tr/urunler?search=yürüyüş%20ayakkabısı">yürüyüş ayakkabısı</a>', '<a href="/tr/urunler?search=fitness%20ekipmanı">fitness ekipmanı</a>', '<a href="/tr/urunler?search=spor%20saat">spor saati</a>'],
        'sources' => ['cdc_weight', 'nih_weight', 'who_activity'],
    ],
    'kosucu-dizi-nedenleri-ve-tedavisi' => [
        'short' => 'Koşucu dizi genellikle diz kapağı çevresinde ağrı, yüklenme artışı, zayıf kalça/core kontrolü veya uygun olmayan antrenman planıyla ilişkilidir. Ağrı devam ediyorsa koşuya ara vermek, yükü azaltmak ve fizyoterapi değerlendirmesi almak güvenli yaklaşımdır.',
        'links' => ['<a href="/tr/urunler?search=koşu%20ayakkabısı">koşu ayakkabısı</a>', '<a href="/tr/urunler?search=diz%20desteği">diz desteği</a>', '<a href="/tr/urunler?search=foam%20roller">foam roller</a>'],
        'sources' => ['runner_knee', 'running_shoes', 'footwear_review'],
    ],
    'serbest-stil-yuzme-teknigi-adim-adim-rehber' => [
        'short' => 'Serbest stil yüzmede verimlilik; suya dengeli uzanma, doğru nefes ritmi, kontrollü kol çekişi ve düzenli tekme koordinasyonuyla gelişir. Hızlanmadan önce su güvenliği, teknik tekrar ve kısa setlerle nefes kontrolü kazanmak daha sağlıklı ilerleme sağlar.',
        'links' => ['<a href="/tr/urunler?search=yüzücü%20gözlüğü">yüzücü gözlüğü</a>', '<a href="/tr/urunler?search=yüzme%20bonesi">yüzme bonesi</a>', '<a href="/tr/urunler?search=yüzme%20tahtası">yüzme tahtası</a>'],
        'sources' => ['redcross_swim', 'who_activity', 'who_guidelines'],
    ],
];

if ($verify) {
    foreach ($enhancements as $slug => $_) {
        $blog = Blog::query()->with('related_translations')->where('slug', $slug)->first();
        if (!$blog) {
            echo "missing\t{$slug}\n";
            continue;
        }

        $tr = $blog->related_translations
            ->where('language', 'tr')
            ->where('key', 'description')
            ->first()?->value;
        $html = (string) ($tr ?: $blog->description);
        echo "verify\t{$blog->id}\t{$slug}\twords=" . countWordsHtml($html)
            . "\tshort=" . (str_contains($html, 'geo-short-answer-start') ? 'yes' : 'no')
            . "\tsources=" . (str_contains($html, 'Güvenilir Kaynaklar') ? 'yes' : 'no')
            . "\n";
    }
    exit(0);
}

$slugs = array_keys($enhancements);
if (!$dryRun) {
    echo "backup\t" . backupBlogs($slugs) . "\n";
}

foreach ($enhancements as $slug => $enhancement) {
    $blog = Blog::query()->with('related_translations')->where('slug', $slug)->first();
    if (!$blog) {
        echo "missing\t{$slug}\n";
        continue;
    }

    $tr = $blog->related_translations
        ->where('language', 'tr')
        ->where('key', 'description')
        ->first()?->value;
    $description = removeMarkedBlocks((string) ($tr ?: $blog->description));
    $sourceItems = array_map(static fn (string $key): string => $GLOBALS['sourceLinks'][$key], $enhancement['sources']);
    $linkItems = listItems($enhancement['links']);
    $sourceHtml = listItems($sourceItems);
    $extra = $enhancement['extra'] ?? '';

    $shortAnswer = <<<HTML
<!-- geo-short-answer-start -->
<div class="geo-answer-box"><p><strong>Kısa cevap:</strong> {$enhancement['short']}</p></div>
<!-- geo-short-answer-end -->
HTML;

    $priorityBlock = <<<HTML
<!-- geo-priority-start -->
{$extra}
<h2>Sportoonline İç Linkleri</h2>
<p>Bu rehberi pratik alışverişe bağlamak için aşağıdaki ürün aramalarını kullanabilirsiniz:</p>
<ul>{$linkItems}</ul>
<h2>Güvenilir Kaynaklar</h2>
<ul>{$sourceHtml}</ul>
<!-- geo-priority-end -->
HTML;

    $updatedDescription = $shortAnswer . trim($description) . $priorityBlock;
    $words = countWordsHtml($updatedDescription);

    if (!$dryRun) {
        $blog->description = $updatedDescription;
        $blog->save();
        upsertBlogTranslation($blog, 'tr', 'description', $updatedDescription);
    }

    echo ($dryRun ? 'dry-run' : 'updated') . "\t{$blog->id}\t{$slug}\twords={$words}\n";
}
