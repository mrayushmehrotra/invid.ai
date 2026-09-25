#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Podcast → Shorts Pipeline"
echo "========================"
echo ""

if [ "$1" = "run" ]; then
    if [ -z "$2" ]; then
        echo "Usage: ./run.sh run <path-to-podcast-video>"
        echo "   or: ./run.sh run <url> --url"
        exit 1
    fi
    source venv/bin/activate 2>/dev/null || { echo "Run 'scripts/setup.sh' first"; exit 1; }
    python -m pipeline.run_episode "$2" "${@:3}"
elif [ "$1" = "api" ]; then
    source venv/bin/activate 2>/dev/null || { echo "Run 'scripts/setup.sh' first"; exit 1; }
    uvicorn dashboard.main:app --host "${HOST:-0.0.0.0}" --port "${PORT:-8000}" --reload
elif [ "$1" = "setup" ]; then
    bash scripts/setup.sh
else
    echo "Commands:"
    echo "  ./run.sh setup          Install dependencies"
    echo "  ./run.sh run <file>     Run pipeline on a local video file"
    echo "  ./run.sh run <url> --url   Run pipeline on a YouTube URL"
    echo "  ./run.sh api            Start the FastAPI review server"
fi