#!/usr/bin/env bash
set -euo pipefail

if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required in .env or environment"
  exit 1
fi

mkdir -p backups

timestamp="$(date +%Y%m%d_%H%M%S)"
output="${1:-backups/full_dump_${timestamp}.dump}"
dump_url="$(node -e "const u=new URL(process.env.DATABASE_URL); u.searchParams.delete('pgbouncer'); console.log(u.toString())")"

PGSSLMODE="${PGSSLMODE:-require}" pg_dump \
  --format=custom \
  --blobs \
  --no-owner \
  --no-acl \
  --file "$output" \
  "$dump_url"

echo "Database dump created: $output"
