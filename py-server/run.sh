#!/bin/bash
# Run both FastAPI (for health/legacy) and gRPC server

# Activate virtual environment
source venv/bin/activate

# Generate gRPC code if not exists
if [ ! -f "app/generated/metadata_pb2.py" ]; then
    echo "Generating gRPC code..."
    bash generate_grpc.sh
fi

# Start gRPC server in background
echo "Starting gRPC server on port 50051..."
python -m app.grpc_server &
GRPC_PID=$!

# Start FastAPI server
echo "Starting FastAPI server on port 8000..."
uvicorn app.index:app --host 0.0.0.0 --port 8000 --reload &
FASTAPI_PID=$!

# Handle shutdown
cleanup() {
    echo "Shutting down servers..."
    kill $GRPC_PID 2>/dev/null
    kill $FASTAPI_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
