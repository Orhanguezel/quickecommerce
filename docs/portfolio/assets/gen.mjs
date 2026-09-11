// QuickEcommerce Bionluk gorselleri — 4 sayfa.
// TUM VERI GERCEK: urun adi/fiyat/stok sportoonline.com /api/v1/product-list,
// magaza adlari /api/v1/store-list, kategori sayilari /api/v1/product-category/list,
// tedarikci kaynaklari ScraperSourceRegistry.php. Musteri kimlikleri maskeli.
import { writeFileSync } from 'node:fs';
import { page, sidebar, topbar, pill, kpi, card, ICON, tl } from './build.mjs';

/* ----------------------------- gercek veri ----------------------------- */
const PRODUCTS = [
  { n: 'XTR Fitness T-Bar Rowing Sabitleyici Aparat', p: 4990, s: 1, st: 'Multiprice', c: 'Fitness' },
  { n: 'Avec Profesyonel Bosu Ball Denge Topu', p: 7490, s: 1, st: 'Multiprice', c: 'Fitness' },
  { n: 'Bona Bosu Ball Denge Topu', p: 3990, s: 1, st: 'Multiprice', c: 'Fitness' },
  { n: 'JOINFIT PRO Muscle Relaxation Foam Roller', p: 2249, s: 2, st: 'Multiprice', c: 'Fitness' },
  { n: 'JOINFIT PRO Anti-Burst Yoga ve Pilates Topu 75 cm', p: 1490, s: 1, st: 'Multiprice', c: 'Yoga' },
  { n: 'Boodun Profesyonel Luminous Bisiklet Eldiveni', p: 948, s: 3, st: 'Multiprice', c: 'Bisiklet' },
  { n: 'Boodun Profesyonel Bisiklet Eldiveni', p: 898, s: 9, st: 'Multiprice', c: 'Bisiklet' },
  { n: 'Boodun Profesyonel Fitness ve Yoga Eldiveni', p: 845, s: 4, st: 'Multiprice', c: 'Fitness' },
  { n: 'Boodun Profesyonel Fitness Eldiveni Siyah', p: 845, s: 2, st: 'Multiprice', c: 'Fitness' },
  { n: 'Boodun Profesyonel Mtb Bisiklet Eldiveni', p: 749, s: 9, st: 'Multiprice', c: 'Bisiklet' },
  { n: 'Tatami Minderi 100x100 cm 13 mm Mavi', p: 300, s: 200, st: 'Multiprice', c: 'Tatami' },
  { n: '10 Adet Tatami Minderi 100x100 cm 13 mm Yeşil', p: 2700, s: 200, st: 'Multiprice', c: 'Tatami' },
];

// /api/v1/store-list — 32 magaza. Kataloglari otomatik eslenenler ustte.
const STORES = [
  { n: 'Muscle Pump', k: 'Sporcu besinleri', src: 'musclepump', plat: 'Custom', ok: true },
  { n: 'Superstacy', k: 'Spor giyim', src: 'superstacy', plat: 'Shopify', ok: true },
  { n: 'Everlast', k: 'Boks ve dövüş', src: 'everlast', plat: 'Shopify', ok: true },
  { n: 'Norfolk', k: 'Çorap ve aksesuar', src: 'norfolk', plat: 'Shopify', ok: true },
  { n: 'Grand Gift Store', k: 'Hediye ve aksesuar', src: 'grandgiftstore', plat: 'WooCommerce', ok: true },
  { n: 'ProteinAVM', k: 'Sporcu besinleri', src: 'proteinavm', plat: 'Ticimax', ok: true },
  { n: 'Compex Turkiye', k: 'Elektro stimülasyon', src: 'compexturkiye', plat: 'WooCommerce', ok: true },
  { n: 'Provitanya', k: 'Takviye ve vitamin', src: 'provitanya', plat: 'OpenCart', ok: true },
  { n: 'Herbinatura', k: 'Bitkisel takviye', src: 'herbinatura', plat: 'IdeaSoft', ok: true },
  { n: 'HeynuT', k: 'Kuruyemiş ve atıştırmalık', src: 'heynut', plat: 'Ticimax', ok: true },
  { n: 'Decathlon', k: 'Genel spor', src: '—', plat: 'Manuel', ok: true },
  { n: 'Maraton Sportswear', k: 'Spor giyim', src: 'maraton', plat: 'Ticimax', ok: false },
];

// /api/v1/product-category/list — urun sayisi donen kategoriler.
const CATEGORIES = [
  { n: 'Genel', c: 1955 },
  { n: 'Spor Giyim ve Ayakkabı', c: 472 },
  { n: 'Spor Beslenmesi', c: 60 },
  { n: 'Diğer Aksesuarlar', c: 6 },
  { n: 'Aksesuar', c: 4 },
  { n: '2 Al 1 Öde Kampanyası', c: 2 },
];

// ScraperSourceRegistry.php — 25 aktif, 8 pasif.
// ScraperSourceRegistry.php — 25 aktif, 8 pasif kaynak. Ilk 17'si listelenir.
const SOURCES = [
  { n: 'compexturkiye', plat: 'WooCommerce Store API', stok: 'Gerçek miktar', st: 'ok', not: 'Cloudflare · stealth' },
  { n: 'provitanya', plat: 'OpenCart', stok: 'Gerçek miktar', st: 'ok', not: 'Toplu JSON uç noktası' },
  { n: 'dekomum', plat: 'WooCommerce Store API', stok: 'Gerçek miktar', st: 'ok', not: 'Yerel stok alanı' },
  { n: 'grandgiftstore', plat: 'WooCommerce Store API', stok: 'Gerçek miktar', st: 'ok', not: 'Yerel stok alanı' },
  { n: 'proteinavm', plat: 'Ticimax', stok: 'Var / yok', st: 'ok', not: 'Cloudflare · stealth' },
  { n: 'eprotein', plat: 'Ticimax', stok: 'Var / yok', st: 'ok', not: 'Yalnız spor ve outdoor' },
  { n: 'heynut', plat: 'Ticimax', stok: 'Var / yok', st: 'ok', not: 'Varyant bazlı stok' },
  { n: 'raketspor_yonex', plat: 'Ticimax', stok: 'Var / yok', st: 'ok', not: 'Yalnız doğrulanan marka' },
  { n: 'herbinatura', plat: 'IdeaSoft', stok: 'Var / yok', st: 'ok', not: 'Microdata okunuyor' },
  { n: 'linktech', plat: 'Odoo', stok: 'Var / yok', st: 'ok', not: 'Liste taraması' },
  { n: 'animaljoy', plat: 'ikas', stok: 'Var / yok', st: 'ok', not: 'Düz HTTP · 9 saniye' },
  { n: 'superstacy', plat: 'Shopify', stok: 'Gerçek miktar', st: 'ok', not: 'Varyant stoku' },
  { n: 'everlast', plat: 'Shopify', stok: 'Gerçek miktar', st: 'ok', not: 'Varyant stoku' },
  { n: 'proteinmax', plat: 'OpenCart', stok: 'Var / yok', st: 'ok', not: 'Buton durumundan' },
  { n: 'musclepump', plat: 'Custom', stok: 'Var / yok', st: 'ok', not: 'Sipariş sonrası teyit' },
  { n: 'maraton', plat: 'Ticimax', stok: '—', st: 'bad', not: 'Kaynak site kapandı' },
  { n: 'speedwa', plat: 'OpenCart', stok: '—', st: 'warn', not: 'Stok sinyali güvenilmez' },
];

const PLATFORMS = [
  { n: 'WooCommerce', c: 10 }, { n: 'Ticimax', c: 4 }, { n: 'Shopify', c: 3 },
  { n: 'OpenCart', c: 3 }, { n: 'Custom', c: 2 }, { n: 'Diğer', c: 3 },
];

const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const stokTag = (s) =>
  s >= 10 ? `<span class="tag ok">Stokta ${s}</span>`
  : s > 0 ? `<span class="tag warn">Stokta ${s}</span>`
  : `<span class="tag bad">Tükendi</span>`;

/* ------------------------------- 00 kapak ------------------------------ */
const cover = page({
  title: 'QuickEcommerce — kapak',
  css: '_cover.css',
  body: `<div class="wrap">
  <div class="left">
    <div class="cbrand"><div class="cmark">${ICON.bolt(30)}</div><div><div class="cname">QuickEcommerce</div><div class="curl">sportoonline.com</div></div></div>
    <h1>Çok satıcılı<br>e-ticaret pazaryeri<br>altyapısı</h1>
    <p>Satıcı yönetimi, pazaryeri ödeme dağıtımı ve tedarikçi fiyat ile stok eşitlemesi tek sistemde. Web, yönetim paneli ve mobil uygulama aynı çekirdeği paylaşır.</p>
    <div class="chips">
      <span>Laravel 12</span><span>Next.js 16</span><span>React 19</span>
      <span>Flutter</span><span>MySQL</span><span>iyzico pazaryeri</span>
    </div>
    <div class="mods">
      <div class="mod">${ICON.store(18)}<span>Satıcı mağazaları, komisyon ve bakiye dağıtımı</span></div>
      <div class="mod">${ICON.sync(18)}<span>Tedarikçi kataloğundan günlük fiyat ve stok eşitlemesi</span></div>
      <div class="mod">${ICON.shield(18)}<span>Sipariş sonrası stok teyidi ve otomatik iade</span></div>
      <div class="mod">${ICON.phone(18)}<span>Web, yönetim paneli ve mobil uygulama aynı API üzerinde</span></div>
    </div>
    <div class="stats">
      <div><b>25</b><i>eşitlenen tedarikçi kaynağı</i></div>
      <div><b>3</b><i>istemci: web, panel, mobil</i></div>
      <div><b>9</b><i>ürün kategorisi</i></div>
    </div>
  </div>
  <div class="right">
    <div class="shot">
      <div class="shot-top"><span class="sd r"></span><span class="sd y"></span><span class="sd g"></span><div class="shot-url">sportoonline.com</div></div>
      <div class="shot-body">
        <div class="hero">
          <span class="hbadge">Yeni sezon spor ekipmanları</span>
          <div class="htitle">Spor Tutkunlarına Özel</div>
          <div class="hbtn">Alışverişe Başla</div>
        </div>
        <div class="grid">
          ${PRODUCTS.slice(0, 9).map(p => `<div class="pc">
            <div class="pc-img">${ICON.box(26)}</div>
            <div class="pc-n">${clip(p.n, 34)}</div>
            <div class="pc-f"><b>${tl(p.p)}</b>${stokTag(p.s)}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="mini">
      <div class="mini-c"><div class="mini-k">Tedarikçi eşitlemesi</div><div class="mini-v">Her gün 05.00</div></div>
      <div class="mini-c"><div class="mini-k">Stok teyidi</div><div class="mini-v">Sipariş + 30 dk</div></div>
      <div class="mini-c"><div class="mini-k">Tükenen üründe</div><div class="mini-v">Otomatik iade</div></div>
    </div>
  </div>
</div>`,
});

/* ---------------------------- 01 vitrin -------------------------------- */
const storefront = page({
  title: 'QuickEcommerce — katalog',
  body: `<div class="page">${sidebar('catalog')}<div class="main">
${topbar({
    title: 'Katalog yönetimi',
    sub: 'Satıcı ürünleri, fiyat ve stok durumu tek listede',
    pills: [pill('Vitrin yayında'), pill('Tedarikçi eşitlemesi açık', 'blue')],
  })}
<div class="body">
  <div class="kpis">
    ${kpi('Yayındaki ürün', '6.686', 'Site haritasındaki indekslenebilir ürün')}
    ${kpi('Satıcı mağazası', '32', '25 mağaza kataloğu otomatik eşitlenir')}
    ${kpi('Ürünlü kategori', '9', 'En büyüğü: Spor Giyim ve Ayakkabı')}
    ${kpi('Tedarikçi kaynağı', '25', '8 kaynak pasif, eşitlemeye girmez', 'mut')}
  </div>
  <div class="row2">
    ${card('Ürün listesi', 'Fiyat ve stok tedarikçi kaynağından günlük eşitlenir',
      `<table>
        <tr><th>Ürün</th><th>Kategori</th><th>Satıcı</th><th class="num">Fiyat</th><th>Stok</th></tr>
        ${PRODUCTS.map(p => `<tr>
          <td class="t-strong">${clip(p.n, 40)}</td>
          <td class="t-mut">${p.c}</td>
          <td class="t-mut">${p.st}</td>
          <td class="num">${tl(p.p)}</td>
          <td>${stokTag(p.s)}</td>
        </tr>`).join('')}
      </table>`)}
    <div style="display:flex;flex-direction:column;gap:16px;min-height:0">
      ${card('Kategori dağılımı', 'Yayındaki ürün sayısına göre',
        `<div class="bars">${CATEGORIES.map(c => `<div class="barrow">
          <span>${clip(c.n, 22)}</span>
          <span class="bar"><i style="width:${Math.round((c.c / 472) * 100)}%"></i></span>
          <b class="num">${c.c}</b>
        </div>`).join('')}</div>`)}
      ${card('Fiyat koruması', 'Yanlış veriye karşı eşitleme kuralı',
        `<table>
          <tr><td class="t-strong">Değişim üst sınırı</td><td class="num">%30</td></tr>
          <tr><td class="t-strong">Sınırı aşan kayıt</td><td><span class="tag warn">Atlanır</span></td></tr>
          <tr><td class="t-strong">Yeni ürün ekleme</td><td><span class="tag info">Kapalı</span></td></tr>
          <tr><td class="t-strong">Eşitlenen alan</td><td class="t-mut">Yalnız fiyat ve stok</td></tr>
        </table>`)}
      ${card('İstemciler', 'Aynı API üzerinde üç arayüz',
        `<table>
          <tr><td class="t-strong">Müşteri vitrini</td><td class="t-mut">Next.js 16 · sunucu render</td></tr>
          <tr><td class="t-strong">Yönetim paneli</td><td class="t-mut">Next.js · rol bazlı yetki</td></tr>
          <tr><td class="t-strong">Mobil uygulama</td><td class="t-mut">Flutter · iOS ve Android</td></tr>
          <tr><td class="t-strong">Satıcı paneli</td><td class="t-mut">Kendi ürün ve siparişleri</td></tr>
        </table>`)}
    </div>
  </div>
</div></div></div>`,
});

/* -------------------------- 02 pazaryeri ------------------------------ */
const marketplace = page({
  title: 'QuickEcommerce — satıcı ve sipariş',
  body: `<div class="page">${sidebar('stores')}<div class="main">
${topbar({
    title: 'Satıcı ve sipariş yönetimi',
    sub: 'Pazaryeri modeli: her satıcı kendi mağazası, ödemesi ve kargosuyla',
    pills: [pill('iyzico pazaryeri modu'), pill('Kargo entegrasyonu açık', 'blue')],
  })}
<div class="body">
  <div class="kpis">
    ${kpi('Satıcı mağazası', '32', 'Her biri kendi kataloğu ve bakiyesiyle')}
    ${kpi('Ödeme dağıtımı', 'Alt üye', 'Tutar doğrudan satıcı bakiyesine')}
    ${kpi('Sipariş durumu', '5 adım', 'Beklemede → teslim edildi')}
    ${kpi('İade yolu', 'Otomatik', 'Stok teyidi başarısızsa iptal ve iade')}
  </div>
  <div class="row2">
    ${card('Satıcı mağazaları', 'Katalog kaynağı ve eşitleme durumu',
      `<table>
        <tr><th>Mağaza</th><th>Alan</th><th>Katalog kaynağı</th><th>Altyapı</th><th>Durum</th></tr>
        ${STORES.map(s => `<tr>
          <td class="t-strong">${s.n}</td>
          <td class="t-mut">${s.k}</td>
          <td class="t-mut">${s.src}</td>
          <td><span class="tag">${s.plat}</span></td>
          <td>${s.ok ? '<span class="tag ok">Eşitleniyor</span>' : '<span class="tag bad">Kaynak kapandı</span>'}</td>
        </tr>`).join('')}
      </table>`)}
    <div style="display:flex;flex-direction:column;gap:16px;min-height:0">
      ${card('Ödeme akışı', 'Pazaryeri modunda tutarın yolu',
        `<table>
          <tr><td class="t-strong">1. Müşteri ödemesi</td><td><span class="tag info">3D Secure</span></td></tr>
          <tr><td class="t-strong">2. Satıcı payı</td><td class="t-mut">Alt üye bakiyesi</td></tr>
          <tr><td class="t-strong">3. Platform komisyonu</td><td class="t-mut">Ana bakiye</td></tr>
          <tr><td class="t-strong">4. Onay ve aktarım</td><td><span class="tag ok">Otomatik</span></td></tr>
          <tr><td class="t-strong">Alternatif yöntem</td><td class="t-mut">Kapıda ödeme, havale</td></tr>
        </table>`)}
      ${card('Sipariş durumları', 'Panelde ve müşteri hesabında aynı adımlar',
        `<table>
          <tr><td class="t-strong">Beklemede</td><td class="t-mut">Ödeme onayı bekliyor</td></tr>
          <tr><td class="t-strong">Onaylandı</td><td class="t-mut">Satıcıya düştü</td></tr>
          <tr><td class="t-strong">İşleniyor</td><td class="t-mut">Hazırlanıyor ve kargoya veriliyor</td></tr>
          <tr><td class="t-strong">Teslim edildi</td><td><span class="tag ok">Tamamlandı</span></td></tr>
          <tr><td class="t-strong">İptal edildi</td><td><span class="tag warn">İade süreci açılır</span></td></tr>
        </table>`)}
      ${card('Kargo ve teslimat', 'Gönderi etiketi ve takip numarası entegre',
        `<table>
          <tr><td class="t-strong">Gönderici adresi</td><td class="t-mut">Satıcı mağazası bazında</td></tr>
          <tr><td class="t-strong">Ücretsiz kargo</td><td class="t-mut">Kampanya eşiğine göre</td></tr>
          <tr><td class="t-strong">Kapıda ödeme</td><td><span class="tag ok">Ürün bazında açılır</span></td></tr>
          <tr><td class="t-strong">Takip bilgisi</td><td class="t-mut">Sipariş detayı ve e-posta</td></tr>
        </table>`)}
    </div>
  </div>
</div></div></div>`,
});

/* ------------------------- 03 fiyat ve stok --------------------------- */
const sync = page({
  title: 'QuickEcommerce — fiyat ve stok eşitleme',
  body: `<div class="page">${sidebar('sync')}<div class="main">
${topbar({
    title: 'Fiyat ve stok eşitleme',
    sub: 'Tedarikçi kataloglarından günlük fiyat ve stok güncellemesi',
    pills: [pill('Bugünkü tur tamamlandı'), pill('2 kaynak incelemede', 'amber')],
  })}
<div class="body">
  <div class="kpis">
    ${kpi('Aktif kaynak', '25', '8 kaynak pasif, eşitlemeye girmez', 'mut')}
    ${kpi('Günlük tur', '05.00', 'Zamanlanmış görev, tek geçiş')}
    ${kpi('Eşitlenen alan', 'Fiyat, stok', 'Yeni ürün ekleme kapalı')}
    ${kpi('Sipariş sonrası teyit', '30 dk', 'Tükenen üründe otomatik iade')}
  </div>
  <div class="row2">
    ${card('Kaynak durumu', 'Altyapı, stok sinyalinin niteliği ve son tur sonucu',
      `<table>
        <tr><th>Kaynak</th><th>Altyapı</th><th>Stok bilgisi</th><th>Not</th><th>Tur</th></tr>
        ${SOURCES.map(s => `<tr>
          <td class="t-strong">${s.n}</td>
          <td class="t-mut">${s.plat}</td>
          <td><span class="tag ${s.stok === 'Gerçek miktar' ? 'ok' : s.stok === '—' ? 'bad' : 'info'}">${s.stok}</span></td>
          <td class="t-mut">${s.not}</td>
          <td>${s.st === 'ok' ? '<span class="tag ok">Başarılı</span>' : s.st === 'warn' ? '<span class="tag warn">İncelemede</span>' : '<span class="tag bad">Pasif</span>'}</td>
        </tr>`).join('')}
      </table>`)}
    <div style="display:flex;flex-direction:column;gap:16px;min-height:0">
      ${card('Altyapıya göre kaynak', 'Her altyapı için ayrı çözümleyici',
        `<div class="chart">${PLATFORMS.map(p => `<div class="col">
          <div class="stack"><div class="seg" style="height:${Math.round((p.c / 10) * 100)}%"></div></div>
          <div class="lab">${p.n}</div><div class="lab"><b>${p.c}</b></div>
        </div>`).join('')}</div>`)}
      ${card('Tükenen üründe iade', 'Sipariş sonrası stok teyidi zinciri',
        `<table>
          <tr><td class="t-strong">1. Ödeme alındı</td><td><span class="tag ok">Tamam</span></td></tr>
          <tr><td class="t-strong">2. 30 dakika bekleme</td><td class="t-mut">Kuyruk görevi</td></tr>
          <tr><td class="t-strong">3. Kaynakta stok teyidi</td><td class="t-mut">Ürün sayfası kontrolü</td></tr>
          <tr><td class="t-strong">4. Tükenmişse</td><td><span class="tag warn">İptal ve iade</span></td></tr>
          <tr><td class="t-strong">5. Belirsizse</td><td><span class="tag info">Manuel kontrol</span></td></tr>
        </table>`)}
    </div>
  </div>
</div></div></div>`,
});

writeFileSync('00-cover.html', cover);
writeFileSync('01-katalog.html', storefront);
writeFileSync('02-pazaryeri.html', marketplace);
writeFileSync('03-fiyat-stok.html', sync);
console.log('4 HTML uretildi');
