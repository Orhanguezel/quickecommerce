#!/usr/bin/env bash
# Aksam (evening) UCUNCU stok/fiyat taramasi — SADECE hizli (bulk) kaynaklar.
#
# Neden: provitanya (Nuxt /api/products, ~0.7s) ve linktech (Odoo /shop liste,
# ~2dk) artik API/liste-tabanli cekiliyor -> saniyeler/dakikalar. Aksam siparis
# zirvesinden (genelde 20:00-23:00) hemen once 3. bir tarama "ogle stokta ->
# aksam yok" penceresini iyice daraltir. 05:00 run-all + 11:00 intraday + 17:00
# evening = gunde 3 tazelik.
#
# Liste bilerek dar: sadece BULK (hizli) cekilebilen kaynaklar. Yavas/per-urun
# kaynaklar (proteinmax 33dk vb.) buraya KONMAZ — aksam turunu hizli tutar.
# run_scraper mantigi run-all.sh / run-intraday-stock.sh ile AYNI tutulmali.
set -uo pipefail

cd /var/www/quikecommerce
DATE=$(date +%Y%m%d)
LOG="/var/www/quikecommerce/logs/scrapers-evening-$DATE.log"
VENV="/var/www/quikecommerce/venv/bin/python3"

# Anti-bot env (run-all.sh ile ayni) — bu iki kaynak kullanmaz ama tutarlilik icin.
export SCRAPER_URL=https://scraper.guezelwebdesign.com
export SCRAPER_API_KEY=scraper-sportoonline-Eq4lGI4KV4CLCMluihY9t9pn0jrZMmf-
export SCRAPER_TIMEOUT=90

# Aksam taranacak HIZLI (bulk) kaynaklar: "name|script|json"
FAST_SOURCES=(
  "provitanya|provitanya_scraper.py|provitanya_products.json"
  "linktech|linktech_scraper.py|linktech_products.json"
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
      --triggered-by="cron-evening" \
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
  echo "QuickEcommerce EVENING (hizli bulk) stok taramasi: $(date -Iseconds)"
  echo "════════════════════════════════════════════════════════════"

  for entry in "${FAST_SOURCES[@]}"; do
    IFS='|' read -r s_name s_script s_json <<< "$entry"
    run_scraper "$s_name" "$s_script" "$s_json"
  done

  echo
  echo "════ Evening bitti: $(date -Iseconds) ════"
  echo "FAIL toplam: ${FAIL_COUNT}"
} 2>&1 | tee -a "$LOG"

if [ "${FAIL_COUNT}" -gt 0 ]; then
  send_tg "🚨 <b>Evening scraper FAIL — ${DATE}</b>${FAIL_LIST}

Log: <code>${LOG}</code>"
fi
