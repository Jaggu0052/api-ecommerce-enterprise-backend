#!/usr/bin/env bash
set -euo pipefail

if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

backup_file="${1:-}"
target_url="${2:-${TARGET_DATABASE_URL:-}}"

if [ -z "$backup_file" ]; then
  echo "Usage: npm run db:restore -- backups/full_dump_YYYYMMDD_HHMMSS.dump \"postgresql://...\""
  exit 1
fi

if [ ! -f "$backup_file" ]; then
  echo "Backup file not found: $backup_file"
  exit 1
fi

if [ -z "$target_url" ]; then
  echo "Target database URL is required as arg 2 or TARGET_DATABASE_URL"
  exit 1
fi

restore_url="$(TARGET_DATABASE_URL="$target_url" node -e "const u=new URL(process.env.TARGET_DATABASE_URL); u.searchParams.delete('pgbouncer'); console.log(u.toString())")"

PGSSLMODE="${PGSSLMODE:-require}" pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  --dbname "$restore_url" \
  "$backup_file"

echo "Database restored into target database"
