#!/usr/bin/env bash
# QuickEcommerce Scraper Saglik Raporu — VPS'te calistirilir
# Usage: /var/www/quikecommerce/scrapers/health.sh
set -uo pipefail
cd /var/www/quikecommerce

echo "═══════════════════════════════════════════════════════════════════════"
echo "  QuickEcommerce Scraper Saglik Raporu — $(date -Iseconds)"
echo "═══════════════════════════════════════════════════════════════════════"
echo

echo "── JSON Output Dosyalari (mtime + boyut + urun sayisi) ──"
shopt -s nullglob
declare -A newest_json=()

# Eski kurulumlar kok dizine, guncel scraper'lar data/source-products altina
# yazar. Ayni dosya iki yerdeyse en yenisini raporla; aksi halde kokte kalmis
# Mayis kopyalari "OLDU" gorunurken gercek gunluk cikti sessizce atlanir.
for f in *_products.json data/source-products/*_products.json; do
  [ -f "$f" ] || continue
  base=$(basename "$f")
  current="${newest_json[$base]:-}"
  if [ -z "$current" ] || [ "$f" -nt "$current" ]; then
    newest_json[$base]="$f"
  fi
done

while IFS= read -r base; do
  [ -n "$base" ] || continue
  f="${newest_json[$base]}"
  size=$(stat --printf="%s" "$f")
  count=$(python3 -c "import json,sys; d=json.load(open('$f')); print(len(d) if isinstance(d,list) else len(d.get('products',[])))" 2>/dev/null || echo "?")
  age_h=$(( ($(date +%s) - $(stat --printf="%Y" "$f")) / 3600 ))
  status="OK   "
  if [ "$count" = "0" ]; then status="BOS  "; fi
  if [ $age_h -gt 48 ]; then status="ESKI "; fi
  if [ $age_h -gt 168 ]; then status="OLDU "; fi
  printf "  [%s] %-32s | %5s urun | %4d saat once | %10s bytes | %s\n" "$status" "$base" "$count" "$age_h" "$size" "$f"
done < <(printf '%s\n' "${!newest_json[@]}" | sort)

echo
echo "── En Son Cron Run (logs/scrapers-*.log) ──"
last_log=$(ls -t logs/scrapers-*.log 2>/dev/null | head -1)
if [ -n "$last_log" ]; then
  echo "  Son log: $last_log"
  echo "  --- son 15 satir: ---"
  tail -15 "$last_log" | sed "s/^/    /"
else
  echo "  Hic cron log yok (henuz cron tetiklenmedi)"
fi

echo
echo "── Cron Durumu ──"
crontab -l 2>/dev/null | grep -E "scraper|run-all" || echo "  (Scraper cron yok)"

echo
echo "── Bu Gunkun Cron Calismasi ──"
today_log="logs/scrapers-$(date +%Y%m%d).log"
if [ -f "$today_log" ]; then
  echo "  $today_log mevcut"
  ok_count=$(grep -c "scraper exit: 0" "$today_log" 2>/dev/null || echo 0)
  fail_count=$(grep -c "scraper exit: [^0]" "$today_log" 2>/dev/null || echo 0)
  sync_ok=$(grep -c "sync exit: 0" "$today_log" 2>/dev/null || echo 0)
  echo "  Scraper basarili: $ok_count, fail: $fail_count, Sync OK: $sync_ok"
else
  echo "  (Bugun cron daha calismadi veya henuz log yok)"
fi

echo
echo "Tam canli takip: tail -f /var/www/quikecommerce/logs/scrapers-\$(date +%Y%m%d).log"
