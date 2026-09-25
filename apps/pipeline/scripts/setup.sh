#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

echo "Setting up Podcast → Shorts Pipeline..."

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip

pip install -r requirements.txt

echo ""
echo "Setup complete!"
echo ""
echo "To run the pipeline:"
echo "  ./run.sh run path/to/podcast.mp4"
echo "  ./run.sh run https://youtube.com/watch?v=... --url"
echo ""
echo "To start the review API:"
echo "  ./run.sh api"
echo ""
echo "Make sure Ollama is running and the model is pulled:"
echo "  ollama pull qwen2.5:0.5b"