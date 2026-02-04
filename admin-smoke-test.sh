#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"
EMAIL="${EMAIL:-orhanguzell@gmail.com}"
PASSWORD="${PASSWORD:-Engin1000145}"
LANG="${LANG:-en}"
RUN_WRITE="${RUN_WRITE:-0}"

log() { printf "\n==> %s\n" "$1"; }

log "Admin Login"
LOGIN_BODY_FILE="$(mktemp)"
HTTP_STATUS=$(
  curl -sS -o "$LOGIN_BODY_FILE" -w "%{http_code}" -X POST "$BASE_URL/api/token" \
    -H "Content-Type: application/json" \
    -H "X-localization: $LANG" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
)
LOGIN_BODY="$(cat "$LOGIN_BODY_FILE")"
rm -f "$LOGIN_BODY_FILE"

echo "Login status: ${HTTP_STATUS:-unknown}"
echo "Login response: $LOGIN_BODY"

if command -v python3 >/dev/null 2>&1; then
  TOKEN=$(printf '%s' "$LOGIN_BODY" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data.get("token",""))' 2>/dev/null)
else
  TOKEN=$(echo "$LOGIN_BODY" | sed -n 's/.*"token":"\\([^"]*\\)".*/\\1/p')
fi
if [ -z "$TOKEN" ]; then
  echo "Token not found. Exiting."
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"
LANG_HEADER="X-localization: $LANG"

log "Dashboard Summary"
curl -sS -H "$AUTH_HEADER" -H "$LANG_HEADER" "$BASE_URL/api/v1/admin/dashboard"

echo

log "Product List"
curl -sS -H "$AUTH_HEADER" -H "$LANG_HEADER" "$BASE_URL/api/v1/admin/product/list?per_page=5"

echo

log "Product Categories List"
curl -sS -H "$AUTH_HEADER" -H "$LANG_HEADER" "$BASE_URL/api/v1/admin/product-categories/list?per_page=5"

echo

log "Slider List"
curl -sS -H "$AUTH_HEADER" -H "$LANG_HEADER" "$BASE_URL/api/v1/admin/slider/list?per_page=5"

echo

log "Maintenance Settings (GET)"
curl -sS -H "$AUTH_HEADER" -H "$LANG_HEADER" "$BASE_URL/api/v1/admin/system-management/maintenance-settings"

echo

log "SEO Settings (GET)"
curl -sS -H "$AUTH_HEADER" -H "$LANG_HEADER" "$BASE_URL/api/v1/admin/system-management/seo-settings"

echo

if [ "$RUN_WRITE" = "1" ]; then
  log "Maintenance Settings (POST) — write test"
  curl -sS -X POST "$BASE_URL/api/v1/admin/system-management/maintenance-settings" \
    -H "$AUTH_HEADER" \
    -H "$LANG_HEADER" \
    -H "Content-Type: application/json" \
    -d '{
      "com_maintenance_title": "Smoke TR Title",
      "com_maintenance_description": "Smoke TR Description",
      "com_maintenance_start_date": null,
      "com_maintenance_end_date": null,
      "com_maintenance_image": "",
      "translations": [
        {
          "language_code": "en",
          "com_maintenance_title": "Smoke EN Title",
          "com_maintenance_description": "Smoke EN Description"
        }
      ],
      "multipart": false
    }'
  echo

  log "Maintenance Settings (GET) — after write"
  curl -sS -H "$AUTH_HEADER" -H "$LANG_HEADER" "$BASE_URL/api/v1/admin/system-management/maintenance-settings"
  echo
fi

log "Logout"
curl -sS -X POST "$BASE_URL/api/logout" -H "$AUTH_HEADER" -H "$LANG_HEADER"

echo
log "Done"
