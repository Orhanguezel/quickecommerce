#!/usr/bin/env bash
# Sportoonline .env içine e-fatura local satırlarını ekler (yoksa).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT}/.env"

API_KEY="${EINVOICE_API_KEY:-sportoonline-dev-api-key}"
WEBHOOK_SECRET="${EINVOICE_WEBHOOK_SECRET:-sportoonline-dev-webhook-secret}"
BASE_URL="${EINVOICE_BASE_URL:-http://127.0.0.1:8210}"

touch "$ENV_FILE"

set_var() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    printf '\n%s=%s\n' "$key" "$value" >>"$ENV_FILE"
  fi
}

set_var EINVOICE_ENABLED true
set_var EINVOICE_BASE_URL "$BASE_URL"
set_var EINVOICE_API_KEY "$API_KEY"
set_var EINVOICE_WEBHOOK_SECRET "$WEBHOOK_SECRET"
set_var EINVOICE_DEFAULT_TCKN 11111111111

echo "Güncellendi: $ENV_FILE"
echo "Sonra: php artisan migrate && php artisan queue:work"
