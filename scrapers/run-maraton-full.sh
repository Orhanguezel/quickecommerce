#!/usr/bin/env bash
# Maraton full catalog scrape: sitemap discovery + import new products.
set -uo pipefail

cd /var/www/quikecommerce
DATE=$(date +%Y%m%d-%H%M)
LOG="/var/www/quikecommerce/logs/maraton-full-$DATE.log"
VENV="/var/www/quikecommerce/venv/bin/python3"
OUT_JSON="maraton_full_products.json"
STORE_ID=47

{
  echo "==== maraton full scrape baslangic: $(date -Iseconds) ===="
  export SCRAPER_URL=https://scraper.guezelwebdesign.com
  export SCRAPER_API_KEY=scraper-sportoonline-Eq4lGI4KV4CLCMluihY9t9pn0jrZMmf-
  export SCRAPER_TIMEOUT=90

  timeout 20h "$VENV" -u maraton_scraper_v2.py --out "$OUT_JSON"
  EX=$?
  echo "scraper exit: $EX"

  if [ ! -s "$OUT_JSON" ] && [ ! -s "data/source-products/$OUT_JSON" ]; then
    echo "FAIL: bos JSON -> import atlandi"
    exit 1
  fi

  JSON_PATH="/var/www/quikecommerce/$OUT_JSON"
  if [ ! -s "$JSON_PATH" ] && [ -s "/var/www/quikecommerce/data/source-products/$OUT_JSON" ]; then
    JSON_PATH="/var/www/quikecommerce/data/source-products/$OUT_JSON"
  fi

  CNT=$("$VENV" -c "import json,sys;print(len(json.load(open(sys.argv[1]))))" "$JSON_PATH" 2>/dev/null || echo 0)
  echo "JSON: $CNT urun ($JSON_PATH)"

  if [ "${CNT:-0}" -lt 100 ]; then
    echo "FAIL: $CNT urun cok az -> import atlandi"
    exit 1
  fi

  cd backend-laravel
  php artisan import:products "$JSON_PATH" "$STORE_ID" \
    --skip-images --status=approved --source-name=maraton --no-interaction 2>&1 | tail -20

  echo "==== maraton full bitti: $(date -Iseconds) ===="
} > "$LOG" 2>&1
