#!/usr/bin/env bash
# Sportoonline perf testi — local (musteri perspektifi) + VPS (backend dogru)
# Her endpoint 3 kez calistirilir, ortalama+min+max raporlanir.

set -u
URL_BASE="https://sportoonline.com"
ITER=3

probe() {
  local label="$1" url="$2"
  local total_ttfb=0 total_full=0 min_full=999 max_full=0 min_ttfb=999 max_ttfb=0
  local size=0 http=0
  for i in $(seq 1 $ITER); do
    out=$(curl -s -L --max-time 30 -A "Mozilla/5.0 (perftest)" -o /dev/null \
      -w "%{http_code}|%{size_download}|%{time_starttransfer}|%{time_total}" \
      "$url?cb=$i-$(date +%s%N)" 2>/dev/null)
    IFS='|' read -r http size ttfb full <<< "$out"
    [ "$http" != "200" ] && [ "$http" != "401" ] && echo "  ⚠ $label iter $i: HTTP $http"
    # python ile float topla
    total_ttfb=$(python3 -c "print($total_ttfb + $ttfb)")
    total_full=$(python3 -c "print($total_full + $full)")
    min_ttfb=$(python3 -c "print(min($min_ttfb, $ttfb))")
    max_ttfb=$(python3 -c "print(max($max_ttfb, $ttfb))")
    min_full=$(python3 -c "print(min($min_full, $full))")
    max_full=$(python3 -c "print(max($max_full, $full))")
  done
  avg_ttfb=$(python3 -c "print(round($total_ttfb / $ITER * 1000, 0))")
  avg_full=$(python3 -c "print(round($total_full / $ITER * 1000, 0))")
  min_ttfb_ms=$(python3 -c "print(round($min_ttfb * 1000, 0))")
  max_full_ms=$(python3 -c "print(round($max_full * 1000, 0))")
  printf "  %-42s TTFB avg %s ms  | Total avg %s ms (min %s, max %s) | %s KB\n" \
    "$label" "$avg_ttfb" "$avg_full" "$min_ttfb_ms" "$max_full_ms" \
    "$(python3 -c "print(round($size/1024, 0))")"
}

echo "════════════════════════════════════════════════════════════════"
echo "Sportoonline Performance Test — $(date -Iseconds)"
echo "ITER=$ITER per endpoint, cache-buster query string"
echo "════════════════════════════════════════════════════════════════"
echo
echo "── 1) Next.js Frontend Pages (TTFB = backend round-trip) ──"
probe "Ana sayfa /tr"                "$URL_BASE/tr"
probe "Kategori (kosu)"              "$URL_BASE/tr/kategori/kosu"
probe "Mağazalar"                    "$URL_BASE/tr/magazalar"
probe "Mağaza (Provitanya)"          "$URL_BASE/tr/magaza/provitanya"
probe "Ürün (whey isolate)"          "$URL_BASE/tr/urun/olimp-whey-isolate-protein-1800-gr"
probe "Search (whey)"                "$URL_BASE/tr/arama?q=whey"
echo
echo "── 2) Backend API Endpoints (no Next.js overhead) ──"
probe "product-list"                 "$URL_BASE/api/v1/product-list?per_page=10"
probe "product-list store=57"        "$URL_BASE/api/v1/product-list?store_id=57&per_page=10"
probe "category-list"                "$URL_BASE/api/v1/category-list"
probe "store-list"                   "$URL_BASE/api/v1/store-list?per_page=20"
probe "product detail (creatine)"    "$URL_BASE/api/v1/product/body-attack-100-pure-creatine-monohydrate-powder-300-gr"
probe "store-details (provitanya)"   "$URL_BASE/api/v1/store-details/provitanya"
echo
echo "── 3) Static Assets (Next.js CDN benzeri) ──"
probe "Logo PNG"                     "$URL_BASE/assets/sportoonline-logo.png"
echo
echo "════════════════════════════════════════════════════════════════"
echo "REFERANSLAR: TTFB ideal <500ms, kabul edilebilir <1s, sorun >2s"
echo "════════════════════════════════════════════════════════════════"
