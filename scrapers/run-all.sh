#!/usr/bin/env bash
# Tum scraperlar + sync chain — gunluk cron entry
set -uo pipefail

cd /var/www/quikecommerce
DATE=$(date +%Y%m%d)
LOG="/var/www/quikecommerce/logs/scrapers-$DATE.log"
VENV="/var/www/quikecommerce/venv/bin/python3"
ROOT_ENV="/var/www/quikecommerce/.env"

# Scrapling stealth env (anti-bot). 2026-06-21'de dis servis
# (scraper.guezelwebdesign.com) KALDIRILDI — CF-agir sitelerde ~1s'de HTTP 500
# doruyordu. Varsayilan artik yerel servis; asagidaki LOCAL_* ile ayni.
if [ -f "$ROOT_ENV" ]; then
  REMOTE_SCRAPER_URL=$(grep -E '^SCRAPER_URL=' "$ROOT_ENV" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
  REMOTE_SCRAPER_API_KEY=$(grep -E '^SCRAPER_API_KEY=' "$ROOT_ENV" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
  LOCAL_SCRAPER_URL=$(grep -E '^LOCAL_SCRAPER_URL=' "$ROOT_ENV" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
  LOCAL_SCRAPER_API_KEY=$(grep -E '^LOCAL_SCRAPER_API_KEY=' "$ROOT_ENV" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
fi
: "${LOCAL_SCRAPER_URL:=http://127.0.0.1:8200}"
: "${REMOTE_SCRAPER_URL:=https://scraper.guezelwebdesign.com}"
if [ -z "${LOCAL_SCRAPER_API_KEY:-}" ]; then
  echo "FAIL: LOCAL_SCRAPER_API_KEY is not configured in $ROOT_ENV" >&2
  exit 1
fi
export SCRAPER_URL="$LOCAL_SCRAPER_URL"
export SCRAPER_API_KEY="$LOCAL_SCRAPER_API_KEY"

# Cloudflare'i SERT siteler dis stealth serviste 429/500 aliyor; yerel stealth
# servis (farkli IP itibari) gecebiliyor. Bu kaynaklar yerel servise yonlenir.
export LOCAL_SCRAPER_URL LOCAL_SCRAPER_API_KEY
# CF arkasindaki kaynaklar (solve_cloudflare + yerel stealth sart)
LOCAL_SCRAPER_SOURCES=" eprotein compexturkiye proteinavm "
export SCRAPER_TIMEOUT=90
# Manuel kurtarma/test kosularinda sadece verilen kaynaklari calistir:
# ONLY_SOURCES="compexturkiye proteinavm" ./scrapers/run-all.sh
ONLY_SOURCES=${ONLY_SOURCES:-}

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

  if [ -n "$ONLY_SOURCES" ] && [[ " $ONLY_SOURCES " != *" $name "* ]]; then
    return 0
  fi

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
  # Cloudflare-sert kaynaklar yerel stealth servisini kullanir (IP itibari farkli)
  local _surl="$SCRAPER_URL" _skey="$SCRAPER_API_KEY"
  local _fallback_url="" _fallback_key=""
  if [[ "$LOCAL_SCRAPER_SOURCES" == *" $name "* ]]; then
    _fallback_url="$REMOTE_SCRAPER_URL"; _fallback_key="$REMOTE_SCRAPER_API_KEY"
    _surl="$LOCAL_SCRAPER_URL"; _skey="$LOCAL_SCRAPER_API_KEY"
    echo "  (yerel stealth servis kullaniliyor: $name)"
  fi
  if [ -n "$extra_args" ]; then
    SCRAPER_URL="$_surl" SCRAPER_API_KEY="$_skey" SCRAPER_FALLBACK_URL="$_fallback_url" SCRAPER_FALLBACK_API_KEY="$_fallback_key" $VENV "$script_path" $extra_args
  else
    SCRAPER_URL="$_surl" SCRAPER_API_KEY="$_skey" SCRAPER_FALLBACK_URL="$_fallback_url" SCRAPER_FALLBACK_API_KEY="$_fallback_key" $VENV "$script_path"
  fi
  local exit=$?
  local end_ts=$(date +%s)
  local duration=$((end_ts - start_ts))
  echo "  scraper exit: $exit (sure: ${duration}s)"

  # Scraperlarin cogu kanonik olarak data/source-products/ altina yazar; proje
  # kokunde ilk importtan kalma ayni isimli dosyalar da olabilir. Eskiden kok
  # dosyasi var diye 2-3 aylik stale JSON sync ediliyordu. Iki adaydan EN YENI
  # basarili/non-empty olani sec; boylece cron yeni scrape'i gercekten uygular.
  local json_path=$json
  local canonical_path="data/source-products/$(basename "$json")"
  if [ -s "$canonical_path" ] && { [ ! -s "$json_path" ] || [ "$canonical_path" -nt "$json_path" ]; }; then
    json_path="$canonical_path"
  fi

  local json_size=0
  if [ -s "$json_path" ]; then
    json_size=$(stat -c%s "$json_path" 2>/dev/null || echo 0)
  fi

  # exit=0 tek basina basari degildir. Bos/iki-byte JSON, scraper'in sessizce
  # bozuldugu anlamina gelir ve DB run kaydinda da FAIL gorunmelidir.
  if [ $exit -eq 0 ] && [ "$json_size" -le 50 ]; then
    exit=66
    echo "  FAIL: $name bos/dejenere JSON (${json_size} byte)"
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
  echo "  sync json: $json_path ($(stat -c %y "/var/www/quikecommerce/$json_path" 2>/dev/null | cut -d. -f1))"
  php artisan sync:source-prices "$name" "/var/www/quikecommerce/$json_path" --apply --max-change-percent=100000
  local sync_exit=$?
  echo "  sync exit: $sync_exit"
  if [ $sync_exit -ne 0 ]; then
    FAIL_COUNT=$((FAIL_COUNT + 1))
    FAIL_LIST="${FAIL_LIST}
• ${name} sync (exit=${sync_exit})"
  fi
  cd /var/www/quikecommerce
  return $sync_exit
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
  run_scraper animaljoy           animaljoy_scraper.py           animaljoy_products.json
  run_scraper everlast       everlast_scraper.py       everlast_products.json
  # swan store#46 pasif ve 2094 urunun tamami soft-delete; bosuna tarama.
  # run_scraper swan           swan_scraper.py           swan_products.json
  run_scraper grandgiftstore grandgiftstore_scraper.py grandgiftstore_products.json
  run_scraper ayakkabi       ayakkabi_scraper.py       ayakkabi_products.json
  run_scraper norfolk        norfolk_scraper.py        norfolk_products.json
  run_scraper superstacy     superstacy_scraper.py     superstacy_products.json
  # floky (Floky Socks) 2026-06-25 SILINDI (store soft-delete + scraper kaldirildi).
  # 2026-07-27 PASIF (kullanici kurali): dropick urun sayfalarinin 11/14'unde
  # JSON-LD availability alani YOK, parser alan bosken "stokta" sayiyor.
  # 57 mapping kaydinin tamami stok>0 — hic 0 uretilmemis.
  # run_scraper dropick        dropick_scraper.py        dropick_products.json
  run_scraper dekomum        scrapers/dekomum_scraper.py dekomum_products.json     "--out data/source-products/dekomum_products.json"
  # protein7 store#33 pasif ve 45 urunun tamami soft-delete; parser korunur,
  # ancak magazayi yeniden acma karari verilene kadar gunluk cron calismaz.
  # run_scraper protein7       protein7_scraper.py       protein7_products.json
  run_scraper yesilmarka     yesilmarka_scraper.py     yesilmarka_products.json

  # 2026-05 yeni kaynak magazalar: fiyat/stok guncelleme.
  run_scraper maskotmeyvepresleri maskotmeyvepresleri_scraper.py maskotmeyvepresleri_products.json
  run_scraper provitanya          provitanya_scraper.py          provitanya_products.json
  run_scraper proteinmax          proteinmax_scraper.py          proteinmax_products.json
  run_scraper ceysport            ceysport_scraper.py            ceysport_products.json
  # 2026-07-27 PASIF (kullanici kurali): speedwa urun sayfalarinda hicbir stok
  # sinyali yok (ne availability ne "tukendi" metni); parser 272 urunu daima
  # stokta yaziyor. Gercek stok gostergesi bulunana kadar kapali.
  # run_scraper speedwa             speedwa_scraper.py             speedwa_products.json
  # 2026-07-27 PASIF (kullanici karari: stok sorunu olacak kaynagi calistirma):
  # herbinatura urun sayfalarinda availability alani YOK (8/8 test), parser
  # alan bosken "stokta" varsayiyor -> 45/45 urun daima stokta, yok satma riski.
  # 2026-07-27 parser microdata availability ile fail-closed hale getirildi;
  # store#61 aktif oldugu icin kaynagi gunluk stok/fiyat zincirine geri al.
  run_scraper herbinatura         herbinatura_scraper.py         herbinatura_products.json
  run_scraper rovabatarya         rovabatarya_scraper.py         rovabatarya_products.json
  run_scraper eyb                 eyb_scraper.py                 eyb_products.json
  run_scraper linktech            linktech_scraper.py            linktech_products.json
  run_scraper musullu             musullu_scraper.py             musullu_products.json
  run_scraper bodyfitshop         bodyfitshop_scraper.py         bodyfitshop_products.json
  run_scraper crestaofficial      crestaofficial_scraper.py      crestaofficial_products.json
  # 2026-07-27 GERI ACILDI: "CF sert duvar" teshisi yanlisti — istekler
  # solve_cloudflare bayragi olmadan gidiyordu, bayrakla ikisi de HTTP 200.
  # STOK TESPITI DOGRULANDI (kullanici kurali: stok sorunu olacak kaynagi acma):
  #   compexturkiye -> WooCommerce Store API native is_in_stock
  #   proteinavm    -> 10 urun testinde 9 OutOfStock / 1 InStock dogru okundu
  run_scraper compexturkiye       compexturkiye_scraper.py       compexturkiye_products.json
  run_scraper proteinavm          proteinavm_scraper.py          proteinavm_products.json
  # 2026-07-27 GERI ACILDI + KAPSAM DARALTILDI (kullanici karari):
  # CF duvari asilamiyor sanilan sorun aslinda eksik bayrakti — istek
  # solve_cloudflare=true ile gidince site HTTP 200 doruyor (dogrulandi).
  # Artik SADECE /spor-outdoor kategorisi cekiliyor (176 urun: ekipman, direnc
  # lastigi, mat, aksesuar); supplementler cekilmiyor. Cikti multiprice
  # (store#41) altina import edildi, eProtein magazasi#69 pasif kaliyor.
  run_scraper eprotein            eprotein_scraper.py            eprotein_products.json
  # 2026-06-02 PASIF (Cloudflare 1010 IP bani, proxy yapilmadi) — bkz. yukaridaki not.
  # run_scraper powertec            powertec_scraper.py            powertec_products.json
  # run_scraper raketspor           raketspor_scraper.py           raketspor_products.json

  echo
  echo "════ Hepsi bitti: $(date -Iseconds) ════"
  echo "FAIL toplam: ${FAIL_COUNT}"
} > >(tee -a "$LOG") 2>&1

# Telegram fail bildirim (gunluk cron disinda manuel calistirmada da gecerli).
if [ "${FAIL_COUNT}" -gt 0 ]; then
  send_tg "🚨 <b>Scraper FAIL — ${DATE}</b>${FAIL_LIST}

Log: <code>${LOG}</code>"
fi

# Ana cron hatasi, daha sonra basarili bir intraday kosusuyla maskelenmesin.
# Son basarili dolu ana run bayatsa kaynak fail-closed stok=0 karantinaya girer.
(cd /var/www/quikecommerce/backend-laravel && php artisan scrapers:enforce-freshness --hours=36 --apply) >> "$LOG" 2>&1 || true
