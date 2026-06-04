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

# 2026-06-04: Telegram fail bildirim (provitanya 10 gun sessiz fail sonrasi).
# .env'den config oku — yoksa send_tg no-op.
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

  # 2026-06-04: Admin dashboard icin DB'ye run kaydi yaz.
  # Fail durumunda son 15 log satiri error_log_excerpt'e konur, otomatik
  # alarm uretilir (ScrapersRecordRun komutu icinde).
  local err_excerpt=""
  if [ $exit -ne 0 ]; then
    err_excerpt=$(tail -15 "$LOG" 2>/dev/null | tr '\n' ' ' | head -c 500)
  fi
  (cd /var/www/quikecommerce/backend-laravel && php artisan scrapers:record-run \
      --source="$name" \
      --exit-code="$exit" \
      --duration="$duration" \
      --json-size="$json_size" \
      --triggered-by="cron" \
      --error-log="$err_excerpt" 2>&1 | head -5) || true

  if [ $exit -ne 0 ] || [ ! -s "$json_path" ]; then
    echo "  FAIL: $name scraper, sync atlaniyor"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    FAIL_LIST="${FAIL_LIST}
• ${name} (exit=${exit})"
    return 1
  fi

  cd /var/www/quikecommerce/backend-laravel
  # Fiyat kaynakla birebir izlensin (30% guard drift'e yol aciyordu).
  # 0/bos fiyat korumasi (hasValidPrice) yine aktif; sadece % limiti kalkti.
  php artisan sync:source-prices "$name" "/var/www/quikecommerce/$json_path" --apply --max-change-percent=100000
  echo "  sync exit: $?"
  cd /var/www/quikecommerce
}

{
  echo "════════════════════════════════════════════════════════════"
  echo "QuickEcommerce daily scrapers: $(date -Iseconds)"
  echo "════════════════════════════════════════════════════════════"

  # Maraton: URL kaynagi ayri dosya (maraton_urls.json) — scraper kendi
  # ciktisini (maraton_products.json) okumaz, circular dependency kirildi.
  # NOT: sync source_name, ProductSourceMapping kayitlariyla BIREBIR eslesmeli.
  # maraton/musclepump mapping'leri "*_import" adiyla kayitli; duz ad 0 satir gunceller.
  #
  # 2026-06-02 PASIF: maraton/powertec/raketspor Cloudflare 1010 (IP bani) yiyor;
  # proxy yapilmayacagina karar verildi. Bu kaynaklar kapali — urunleri sportoonline'da
  # status=inactive yapildi. Her gun bosuna deneyip hata loglamasin diye cron'dan cikarildi.
  # Proxy eklenirse (bkz. vps-guezel/scraper-service/ISTEK-cloudflare-1010-proxy-fix.md)
  # asagidaki 3 satir geri acilabilir.
  # run_scraper maraton_import    maraton_scraper_v2.py     maraton_products.json       "--urls-from maraton_urls.json"
  run_scraper musclepump_import musclepump_scraper.py     musclepump_products.json
  run_scraper everlast       everlast_scraper.py       everlast_products.json
  run_scraper swan           swan_scraper.py           swan_products.json
  run_scraper grandgiftstore grandgiftstore_scraper.py grandgiftstore_products.json
  run_scraper ayakkabi       ayakkabi_scraper.py       ayakkabi_products.json
  run_scraper norfolk        norfolk_scraper.py        norfolk_products.json
  run_scraper superstacy     superstacy_scraper.py     superstacy_products.json
  run_scraper dropick        dropick_scraper.py        dropick_products.json
  run_scraper dekomum        scrapers/dekomum_scraper.py dekomum_products.json     "--out data/source-products/dekomum_products.json"
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
  # 2026-06-02 PASIF (Cloudflare 1010 IP bani, proxy yapilmadi) — bkz. yukaridaki not.
  # run_scraper powertec            powertec_scraper.py            powertec_products.json
  # run_scraper raketspor           raketspor_scraper.py           raketspor_products.json

  echo
  echo "════ Hepsi bitti: $(date -Iseconds) ════"
  echo "FAIL toplam: ${FAIL_COUNT}"
} 2>&1 | tee -a "$LOG"

# Telegram fail bildirim (gunluk cron disinda manuel calistirmada da gecerli).
if [ "${FAIL_COUNT}" -gt 0 ]; then
  send_tg "🚨 <b>Scraper FAIL — ${DATE}</b>${FAIL_LIST}

Log: <code>${LOG}</code>"
fi
