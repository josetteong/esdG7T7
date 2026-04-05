#!/usr/bin/env bash
# Applies schema.sql and seed.sql to Supabase using env from ../.env
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
if [[ ! -f "$ENV_FILE" ]]; then echo "Missing $ENV_FILE"; exit 1; fi
# Load .env (basic)
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a
: "${DB_USER:?Missing DB_USER}" "${DB_PASSWORD:?Missing DB_PASSWORD}" "${DB_HOST:?Missing DB_HOST}" "${DB_PORT:?Missing DB_PORT}" "${DB_NAME:?Missing DB_NAME}"
CONN="host=$DB_HOST port=$DB_PORT user=$DB_USER dbname=$DB_NAME sslmode=require"
echo "Applying schema.sql and seed.sql to $DB_HOST/$DB_NAME as $DB_USER"
docker run --rm -e PGPASSWORD="$DB_PASSWORD" -v "$ROOT:/sql" -w /sql postgres:15-alpine sh -lc "psql \"$CONN\" -v ON_ERROR_STOP=1 -f schema.sql -f seed.sql"