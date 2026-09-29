# Ürün zenginleştirme kuralları (2026-09-29)

Amaç: Sportoonline ürün sayfasına, **aynı marka + aynı ürün** (aynı model kodu / gramaj / hacim /
renk / aroma) için doğrulanmış teknik bilgi eklemek. Yanlış bilgi, eksik bilgiden kötüdür.

## Eşleşme (en önemli kural)
- Önce ürünü kesin tanımla: marka, model/ürün kodu, varyant (gramaj, hacim, ölçü, renk, aroma, adet).
- Kaynak sayfa **aynı ürünü** anlatmalı. Farklı gramaj/hacim/model = farklı ürün; o sayfadaki sayısal
  değerleri kullanma (örn. 0,5 L termosun ağırlığını 0,75 L sürümden alma).
- `match_confidence`:
  - `high`: üretici/resmî distribütör sayfası veya ürünün kendi tedarikçi sayfası (`source_url`) aynı model kodunu/varyantı gösteriyor.
  - `medium`: yalnız büyük perakendeciler, en az 2 bağımsız kaynak aynı değerleri veriyor.
  - `low`: kesin eşleşme yok → `description_html` ve `specifications` BOŞ bırak, nedenini `notes`'a yaz.
- Markası bilinmeyen jenerik ürünlerde (örn. "10 Adet Tatami", "Dambıl Seti") yalnız ürünün kendi
  tedarikçi sayfası (`source_url`) ve Sportoonline'daki mevcut açıklama güvenilir kaynaktır; başka
  markanın benzer ürününden değer taşıma.

## Kaynak önceliği
1. Üretici resmî sitesi / resmî Türkiye distribütörü
2. Ürünün kendi tedarikçi sayfası (`source_url` — Sportoonline'ın ürünü aldığı satıcı)
3. Büyük perakendeciler (çapraz doğrulama için; tek başına yeterli değil)
- Her sayısal/teknik değerin yanında hangi kaynaktan geldiği (`source` URL) olmalı.
- Kaynaklar arasında çelişki varsa üretici kazanır; çelişkiyi `conflicts`'e yaz.

## Yasak
- Uydurma değer, tahmini ölçü, "yaklaşık" sayı, var olmayan sertifika.
- GTIN/barkod yalnız üretici ya da resmî listeleme açıkça gösteriyorsa; aksi halde boş.
- **Sağlık / tedavi / hastalık iddiası yok.** Gıda takviyesinde yalnız etiket gerçekleri: içerik,
  porsiyon, porsiyon sayısı, besin değerleri, alerjen, kullanım şekli (etikette yazdığı kadar),
  uyarılar. "Kas yapar, yağ yakar, bağışıklığı güçlendirir, ağrıyı giderir" gibi ifadeler YASAK.
- Medikal cihazda (TENS/EMS/lenf/ultrason) yalnız üreticinin teknik verisi: kanal sayısı, program sayısı,
  güç kaynağı, ölçü, ağırlık, kutu içeriği, uyumluluk. Tedavi vaadi, endikasyon listesi YASAK;
  "kullanmadan önce hekime/fizyoterapiste danışın" notu eklenebilir.
- Rakip mağaza adı, fiyat, stok, kampanya, "en ucuz", "en iyi" gibi ifadeler.
- Kaynak metni birebir kopyalamak. Kendi cümlelerinle, sade Türkçe yaz (teknik değerler aynen kalır).
- Marka yazımını değiştirme; Sportoonline markasını ürün markası gibi yazma.

## Çıktı
Her ürün için `scripts/enrichment-2026-09-29/output/<id>.json`:

```json
{
  "id": 15594,
  "slug": "grubit-protein-bar",
  "current_name": "GRUBIT PROTEIN BAR",
  "identity": {"brand": "Grubit", "model": "", "variant": "60 g, Çikolata", "gtin": "", "mpn": ""},
  "match_confidence": "high|medium|low",
  "match_evidence": "üretici sayfasında aynı ürün adı + 60 g …",
  "description_html": "<p>…</p><h3>Öne Çıkan Özellikler</h3><ul><li>…</li></ul><h3>Kutu İçeriği</h3><ul>…</ul>",
  "specifications": [{"name": "Net Ağırlık", "value": "60 g", "source": "https://…"}],
  "sources": ["https://…"],
  "conflicts": "",
  "notes": "",
  "suggested_brand": "Grubit"
}
```

- `description_html`: 120–350 kelime, yalnız `<p> <h3> <ul> <li> <strong> <table><tr><th><td>` etiketleri.
  Yapı: 1–2 cümle ne olduğu → Öne Çıkan Özellikler → (varsa) Kullanım / Kutu İçeriği / Uyarılar.
  Takviyede "Besin Değerleri" tablosu yalnız etiketten birebir değerlerle.
- `specifications`: 4–12 satır, kısa ad + değer (örn. "Malzeme": "Paslanmaz çelik (18/8)").
- Mevcut Sportoonline açıklamasında doğru bilgi varsa koru ve genişlet; yanlışsa `conflicts`'e yaz.
