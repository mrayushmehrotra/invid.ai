#!/bin/bash
# Generate Python gRPC code from proto file

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROTO_DIR="$SCRIPT_DIR/../proto"
OUTPUT_DIR="$SCRIPT_DIR/app/generated"

echo "🔧 Generating Python gRPC code..."
echo "📁 Proto directory: $PROTO_DIR"
echo "📁 Output directory: $OUTPUT_DIR"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Generate Python code
python -m grpc_tools.protoc \
    -I"$PROTO_DIR" \
    --python_out="$OUTPUT_DIR" \
    --grpc_python_out="$OUTPUT_DIR" \
    "$PROTO_DIR/metadata.proto"

# Fix import in generated file (grpc_tools generates incorrect import)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's/import metadata_pb2/from app.generated import metadata_pb2/' "$OUTPUT_DIR/metadata_pb2_grpc.py"
else
    # Linux
    sed -i 's/import metadata_pb2/from app.generated import metadata_pb2/' "$OUTPUT_DIR/metadata_pb2_grpc.py"
fi

echo "✅ Python gRPC code generated successfully!"
