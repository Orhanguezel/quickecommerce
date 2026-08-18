#!/usr/bin/env bash
# Maraton full catalog scrape: sitemap discovery + import new products.
set -uo pipefail

cd /var/www/quikecommerce
DATE=$(date +%Y%m%d-%H%M)
LOG="/var/www/quikecommerce/logs/maraton-full-$DATE.log"
VENV="/var/www/quikecommerce/venv/bin/python3"
OUT_JSON="maraton_full_products.json"
STORE_ID=47
ROOT_ENV="/var/www/quikecommerce/.env"

if [ -f "$ROOT_ENV" ]; then
  SCRAPER_URL=$(grep -E '^SCRAPER_URL=' "$ROOT_ENV" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
  SCRAPER_API_KEY=$(grep -E '^SCRAPER_API_KEY=' "$ROOT_ENV" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
fi
: "${SCRAPER_URL:=https://scraper.guezelwebdesign.com}"
if [ -z "${SCRAPER_API_KEY:-}" ]; then
  echo "FAIL: SCRAPER_API_KEY is not configured in $ROOT_ENV" >&2
  exit 1
fi
export SCRAPER_URL SCRAPER_API_KEY

{
  echo "==== maraton full scrape baslangic: $(date -Iseconds) ===="
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
