#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"
EMAIL="testcustomer@example.com"
PASSWORD="Test1234!"
PRODUCT_ID="144"
ORDER_ID="1"
TICKET_ID="1"
LANG="en"

log() { printf "\n==> %s\n" "$1"; }

log "Login"
TMP_LOGIN_BODY="$(mktemp)"
HTTP_STATUS=$(curl -sS -o "$TMP_LOGIN_BODY" -w "%{http_code}" -X POST "$BASE_URL/api/v1/customer/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

LOGIN_BODY=$(cat "$TMP_LOGIN_BODY")
rm -f "$TMP_LOGIN_BODY"

echo "Login status: ${HTTP_STATUS:-unknown}"
echo "Login response: $LOGIN_BODY"

TOKEN=$(printf "%s" "$LOGIN_BODY" | php -r '$d=json_decode(stream_get_contents(STDIN), true); echo $d["token"] ?? "";')

if [ -z "$TOKEN" ]; then
  echo "Token not found. Exiting."
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"

log "Banner List"
curl -sS "$BASE_URL/api/v1/banner-list?theme_name=default&language=$LANG"

echo

log "Slider List"
curl -sS "$BASE_URL/api/v1/slider-list?platform=web&language=$LANG"

echo

log "Top Deal Products"
curl -sS "$BASE_URL/api/v1/top-deal-products?per_page=10&language=$LANG"

echo

log "Product Suggestion"
curl -sS "$BASE_URL/api/v1/product-suggestion?query=iphone"

echo

log "Keyword Suggestion"
curl -sS "$BASE_URL/api/v1/keyword-suggestion?query=iph"

echo

log "Generate HMAC (Order)"
curl -sS -H "$AUTH_HEADER" "$BASE_URL/api/v1/customer/generate-hmac?order_id=$ORDER_ID"

echo

log "Extra Charge"
curl -sS "$BASE_URL/api/v1/get-check-out-page-extra-info?product_ids[]=$PRODUCT_ID"

echo

log "Support Ticket Message (no file)"
curl -sS -X POST "$BASE_URL/api/v1/customer/support-ticket/add-message" \
  -H "$AUTH_HEADER" \
  -F "ticket_id=$TICKET_ID" \
  -F "message=Smoke test message"

echo

log "Support Ticket Message (with file)"
TMP_FILE="/tmp/smoke_upload.png"
printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6xk9cAAAAASUVORK5CYII=' | base64 -d > "$TMP_FILE"
curl -sS -X POST "$BASE_URL/api/v1/customer/support-ticket/add-message" \
  -H "$AUTH_HEADER" \
  -F "ticket_id=$TICKET_ID" \
  -F "message=Smoke test message with file" \
  -F "file=@$TMP_FILE"

echo

log "Logout"
curl -sS -X POST "$BASE_URL/api/logout" -H "$AUTH_HEADER"

echo

log "Done"
