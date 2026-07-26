#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${PORT:-3001}"
echo "[start.sh] Starting TripWise AI API on port $PORT..."
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
