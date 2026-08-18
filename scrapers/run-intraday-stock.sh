#!/usr/bin/env bash
# Ogleden sonra (intraday) IKINCI stok/fiyat taramasi — SADECE bool-only
# takviye kaynaklari icin.
#
# Neden: provitanya/proteinmax gibi bool-only kaynaklar sabah cron (05:00 TR)
# ile "stokta" gorunur, musteri aksam siparis verince tedarikci tukenmis olur
# -> post-order otomatik iyzico iade (satis kaybi). Gun ortasinda 2. bir tarama
# "sabah stokta -> aksam yok" penceresini ~9 saatten ~4-5 saate dusurur.
#
# Gunluk TUM scraper cron'u ayri: run-all.sh (02:00 UTC / 05:00 TR).
# Bu script onun hafif kardesi; run_scraper mantigi run-all.sh ile AYNI tutulmali.
# Liste bilerek dar: sadece guvenilir + iptal ureten bool-only takviye kaynaklari.
# (eprotein/proteinavm/musclepump intraday'e DAHIL DEGIL — bilinen FAIL'ler,
#  Telegram alarm spam'ini ikiye katlamasin; sabah run-all.sh onlari zaten dener.)
set -uo pipefail

cd /var/www/quikecommerce
DATE=$(date +%Y%m%d)
LOG="/var/www/quikecommerce/logs/scrapers-intraday-$DATE.log"
VENV="/var/www/quikecommerce/venv/bin/python3"
ROOT_ENV="/var/www/quikecommerce/.env"

# Anti-bot (run-all.sh ile ayni)
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
export SCRAPER_TIMEOUT=90

# Intraday taranacak bool-only kaynaklar: "name|script|json"
BOOL_SOURCES=(
  "provitanya|provitanya_scraper.py|provitanya_products.json"
  "proteinmax|proteinmax_scraper.py|proteinmax_products.json"
  "protein7|protein7_scraper.py|protein7_products.json"
  "bodyfitshop|bodyfitshop_scraper.py|bodyfitshop_products.json"
)

# Telegram fail bildirim (run-all.sh ile ayni mantik)
ENV_FILE="/var/www/quikecommerce/backend-laravel/.env"
TG_TOKEN=""
TG_CHAT=""
if [ -f "$ENV_FILE" ]; then
  TG_TOKEN=$(grep -E '^TELEGRAM_ALARM_BOT_TOKEN=' "$ENV_FILE" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
  TG_CHAT=$(grep -E '^TELEGRAM_ALARM_CHAT_ID=' "$ENV_FILE" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
fi

send_tg() {
  [ -z "$TG_TOKEN" ] && return 0
  [ -z "$TG_CHAT" ] && return 0
  curl -sS --max-time 10 \
    "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
    -d "chat_id=${TG_CHAT}" \
    --data-urlencode "text=$1" \
    -d "parse_mode=HTML" \
    -d "disable_web_page_preview=true" > /dev/null
}

FAIL_COUNT=0
FAIL_LIST=""

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

  local start_ts=$(date +%s)
  if [ -n "$extra_args" ]; then
    $VENV "$script_path" $extra_args
  else
    $VENV "$script_path"
  fi
  local exit=$?
  local end_ts=$(date +%s)
  local duration=$((end_ts - start_ts))
  echo "  scraper exit: $exit (sure: ${duration}s)"

  local json_path=$json
  if [ ! -s "$json_path" ] && [ -s "data/source-products/$(basename "$json")" ]; then
    json_path="data/source-products/$(basename "$json")"
  fi

  local json_size=0
  if [ -s "$json_path" ]; then
    json_size=$(stat -c%s "$json_path" 2>/dev/null || echo 0)
  fi

  local err_excerpt=""
  if [ $exit -ne 0 ]; then
    err_excerpt=$(tail -15 "$LOG" 2>/dev/null | tr '\n' ' ' | head -c 500)
  fi
  (cd /var/www/quikecommerce/backend-laravel && php artisan scrapers:record-run \
      --source="$name" \
      --exit-code="$exit" \
      --duration="$duration" \
      --json-size="$json_size" \
      --triggered-by="cron-intraday" \
      --error-log="$err_excerpt" 2>&1 | head -5) || true

  if [ $exit -ne 0 ] || [ ! -s "$json_path" ]; then
    echo "  FAIL: $name scraper, sync atlaniyor"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    FAIL_LIST="${FAIL_LIST}
• ${name} (exit=${exit})"
    return 1
  fi

  cd /var/www/quikecommerce/backend-laravel
  php artisan sync:source-prices "$name" "/var/www/quikecommerce/$json_path" --apply --max-change-percent=100000
  echo "  sync exit: $?"
  cd /var/www/quikecommerce
}

{
  echo "════════════════════════════════════════════════════════════"
  echo "QuickEcommerce INTRADAY bool-only stok taramasi: $(date -Iseconds)"
  echo "════════════════════════════════════════════════════════════"

  for entry in "${BOOL_SOURCES[@]}"; do
    IFS='|' read -r s_name s_script s_json <<< "$entry"
    run_scraper "$s_name" "$s_script" "$s_json"
  done

  echo
  echo "════ Intraday bitti: $(date -Iseconds) ════"
  echo "FAIL toplam: ${FAIL_COUNT}"
} 2>&1 | tee -a "$LOG"

if [ "${FAIL_COUNT}" -gt 0 ]; then
  send_tg "🚨 <b>Intraday scraper FAIL — ${DATE}</b>${FAIL_LIST}

Log: <code>${LOG}</code>"
fi
