#!/usr/bin/env bash
# Tum scraperlar + sync chain — gunluk cron entry
set -uo pipefail

cd /var/www/quikecommerce
DATE=$(date +%Y%m%d)
LOG="/var/www/quikecommerce/logs/scrapers-$DATE.log"
VENV="/var/www/quikecommerce/venv/bin/python3"

# Maraton icin Scrapling env (anti-bot)
export SCRAPER_URL=https://scraper.guezelwebdesign.com
export SCRAPER_API_KEY=scraper-sportoonline-Eq4lGI4KV4CLCMluihY9t9pn0jrZMmf-
export SCRAPER_TIMEOUT=90

run_scraper() {
  local name=$1
  local script=$2
  local json=$3
  local extra_args=${4:-}
  local script_path=$script

  echo
  echo "════ $name baslangic: $(date -Iseconds) ════"
  if [ ! -f "$script_path" ] && [ -f "scrapers/$script" ]; then
    script_path="scrapers/$script"
  fi
  if [ ! -f "$script_path" ]; then
    echo "  FAIL: $name script bulunamadi: $script"
    return 1
  fi

  if [ -n "$extra_args" ]; then
    $VENV "$script_path" $extra_args
  else
    $VENV "$script_path"
  fi
  local exit=$?
  echo "  scraper exit: $exit"

  local json_path=$json
  if [ ! -s "$json_path" ] && [ -s "data/source-products/$(basename "$json")" ]; then
    json_path="data/source-products/$(basename "$json")"
  fi

  if [ $exit -ne 0 ] || [ ! -s "$json_path" ]; then
    echo "  FAIL: $name scraper, sync atlaniyor"
    return 1
  fi

  cd /var/www/quikecommerce/backend-laravel
  php artisan sync:source-prices "$name" "/var/www/quikecommerce/$json_path" --apply
  echo "  sync exit: $?"
  cd /var/www/quikecommerce
}

{
  echo "════════════════════════════════════════════════════════════"
  echo "QuickEcommerce daily scrapers: $(date -Iseconds)"
  echo "════════════════════════════════════════════════════════════"

  # Maraton: URL kaynagi ayri dosya (maraton_urls.json) — scraper kendi
  # ciktisini (maraton_products.json) okumaz, circular dependency kirildi.
  run_scraper maraton        maraton_scraper_v2.py     maraton_products.json       "--urls-from maraton_urls.json"
  run_scraper musclepump     musclepump_scraper.py     musclepump_products.json
  run_scraper everlast       everlast_scraper.py       everlast_products.json
  run_scraper swan           swan_scraper.py           swan_products.json
  run_scraper grandgiftstore grandgiftstore_scraper.py grandgiftstore_products.json
  run_scraper ayakkabi       ayakkabi_scraper.py       ayakkabi_products.json
  run_scraper norfolk        norfolk_scraper.py        norfolk_products.json
  run_scraper superstacy     superstacy_scraper.py     superstacy_products.json
  run_scraper dropick        dropick_scraper.py        dropick_products.json
  run_scraper dekomum        scrapers/dekomum_scraper.py dekomum_products.json     "--out dekomum_products.json"
  run_scraper protein7       protein7_scraper.py       protein7_products.json
  run_scraper yesilmarka     yesilmarka_scraper.py     yesilmarka_products.json

  # 2026-05 yeni kaynak magazalar: fiyat/stok guncelleme.
  run_scraper maskotmeyvepresleri maskotmeyvepresleri_scraper.py maskotmeyvepresleri_products.json
  run_scraper provitanya          provitanya_scraper.py          provitanya_products.json
  run_scraper proteinmax          proteinmax_scraper.py          proteinmax_products.json
  run_scraper ceysport            ceysport_scraper.py            ceysport_products.json
  run_scraper speedwa             speedwa_scraper.py             speedwa_products.json
  run_scraper herbinatura         herbinatura_scraper.py         herbinatura_products.json
  run_scraper rovabatarya         rovabatarya_scraper.py         rovabatarya_products.json
  run_scraper eyb                 eyb_scraper.py                 eyb_products.json
  run_scraper linktech            linktech_scraper.py            linktech_products.json
  run_scraper musullu             musullu_scraper.py             musullu_products.json
  run_scraper bodyfitshop         bodyfitshop_scraper.py         bodyfitshop_products.json
  run_scraper crestaofficial      crestaofficial_scraper.py      crestaofficial_products.json
  run_scraper compexturkiye       compexturkiye_scraper.py       compexturkiye_products.json
  run_scraper proteinavm          proteinavm_scraper.py          proteinavm_products.json
  run_scraper eprotein            eprotein_scraper.py            eprotein_products.json
  run_scraper powertec            powertec_scraper.py            powertec_products.json
  run_scraper raketspor           raketspor_scraper.py           raketspor_products.json

  echo
  echo "════ Hepsi bitti: $(date -Iseconds) ════"
} 2>&1 | tee -a "$LOG"
