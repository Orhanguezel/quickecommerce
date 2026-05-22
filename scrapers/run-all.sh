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

run_scraper() {
  local name=$1
  local script=$2
  local json=$3
  local extra_args=${4:-}

  echo
  echo "════ $name baslangic: $(date -Iseconds) ════"
  if [ -n "$extra_args" ]; then
    $VENV "$script" $extra_args
  else
    $VENV "$script"
  fi
  local exit=$?
  echo "  scraper exit: $exit"

  if [ $exit -ne 0 ] || [ ! -s "$json" ]; then
    echo "  FAIL: $name scraper, sync atlaniyor"
    return 1
  fi

  cd /var/www/quikecommerce/backend-laravel
  php artisan sync:source-prices "$name" "/var/www/quikecommerce/$json" --apply
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

  echo
  echo "════ Hepsi bitti: $(date -Iseconds) ════"
} 2>&1 | tee -a "$LOG"
