#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
SOCIALIZER="$ROOT/apps/socializer"
PIPELINE="$ROOT/apps/pipeline"

cleanup() {
  echo ""
  echo "Shutting down..."
  kill "$NEXT_PID" 2>/dev/null
  kill "$PY_PID" 2>/dev/null
  wait 2>/dev/null
  echo "Done."
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "========================================="
echo "  invid.ai — Starting all services"
echo "========================================="
echo ""

# --- Frontend (Next.js) ---
echo "[1/2] Starting Next.js frontend on :3000"
cd "$SOCIALIZER"
pnpm install && pnpm dev &
NEXT_PID=$!

# --- Backend (FastAPI) ---
echo "[2/2] Starting Python FastAPI backend on :8000"
cd "$PIPELINE"
if [ ! -f "venv/bin/activate" ]; then
  echo "   Python venv not found — running setup first..."
  bash scripts/setup.sh
fi
source venv/bin/activate
bash run.sh api &
PY_PID=$!

echo ""
echo "All services started:"
echo "  Frontend  -> http://localhost:3000"
echo "  Backend   -> http://localhost:8000"
echo "  Press Ctrl+C to stop both"
echo ""

wait
