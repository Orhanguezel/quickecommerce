<?php
// Compex 161 urun: image=NULL. JSON'da thumbnail_url ve all_image_urls var,
// ama image URL'leri CF korumali, file_get_contents 403 -> download fail.
// Frontend com_get_attachment_by_id http:// URL'leri direct handle ediyor:
//   "Support external URLs - if it starts with http://, return URL info directly"
// Yani product.image = remote URL string set etmek yeterli.

$jsonPath = '/var/www/data/source-products/compexturkiye_products.json';
$storeId = 70;
$products = json_decode(file_get_contents($jsonPath), true);
echo "JSON: " . count($products) . " urun\n";

// PHP karsiligi normalizeImageUrl (ImportDropickProducts::normalizeImageUrl)
function normalizeImageUrl(string $url): string
{
    $parts = parse_url(trim($url));
    if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
        return trim($url);
    }
    $path = $parts['path'] ?? '';
    $encodedPath = implode('/', array_map(
        fn (string $segment) => rawurlencode(rawurldecode($segment)),
        explode('/', $path)
    ));
    $result = $parts['scheme'] . '://' . $parts['host'];
    if (isset($parts['port']))  $result .= ':' . $parts['port'];
    $result .= $encodedPath;
    if (isset($parts['query']))    $result .= '?' . $parts['query'];
    if (isset($parts['fragment'])) $result .= '#' . $parts['fragment'];
    return $result;
}

$updated = 0; $alreadyHasImage = 0; $notFound = 0; $noUrl = 0;

foreach ($products as $data) {
    $slug = $data['slug'] ?? '';
    if (empty($slug)) { $noUrl++; continue; }

    $product = App\Models\Product::where('store_id', $storeId)
        ->where('slug', $slug)
        ->first();
    if (!$product) { $notFound++; continue; }
    if (!empty($product->image)) { $alreadyHasImage++; continue; }

    $thumbnail = $data['thumbnail_url'] ?? '';
    if (empty($thumbnail)) { $noUrl++; continue; }

    $mainUrl = normalizeImageUrl($thumbnail);
    $product->image = $mainUrl;

    // Gallery: ilk 5 ek gorsel (thumbnail haric)
    $galleryUrls = array_slice($data['all_image_urls'] ?? [], 0, 6);
    $galleryStrings = [];
    foreach ($galleryUrls as $url) {
        $norm = normalizeImageUrl($url);
        if ($norm !== $mainUrl) {
            $galleryStrings[] = $norm;
        }
    }
    if (count($galleryStrings) > 5) {
        $galleryStrings = array_slice($galleryStrings, 0, 5);
    }
    if (!empty($galleryStrings)) {
        $product->gallery_images = implode(',', $galleryStrings);
    }

    $product->save();
    $updated++;
}

echo "\n=== Sonuc ===\n";
echo "  Guncellenen (image set edildi): $updated\n";
echo "  Zaten image vardi:              $alreadyHasImage\n";
echo "  Eslesmeyen (slug):              $notFound\n";
echo "  JSON'da URL yok:                $noUrl\n";
