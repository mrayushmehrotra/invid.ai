# gRPC Setup Instructions

## Installation

### Python Server (py-server/)
```bash
cd py-server
source venv/bin/activate
pip install grpcio grpcio-tools
```

### Next.js App (apps/socializer/)
```bash
cd apps/socializer
pnpm add @grpc/grpc-js @grpc/proto-loader
```

## Generate Python gRPC Code
After installing dependencies, generate the Python gRPC code:

```bash
cd py-server
chmod +x generate_grpc.sh
./generate_grpc.sh
```

## Running the Servers

### Start Python gRPC + FastAPI servers:
```bash
cd py-server
chmod +x run.sh
./run.sh
```

This starts:
- **gRPC server** on port `50051`
- **FastAPI server** on port `8000` (for health checks/legacy)

### Start Next.js:
```bash
cd apps/socializer
pnpm dev
```

## Environment Variables

### Next.js (.env or .env.local)
```env
GRPC_SERVER_URL=localhost:50051
```

### Python (.env)
```env
GRPC_PORT=50051
```

## Architecture

```
┌─────────────────┐     gRPC (50051)     ┌─────────────────┐
│   Next.js App   │ ──────────────────── │  Python Server  │
│  (Socializer)   │      Protocol        │  (gRPC Server)  │
└─────────────────┘      Buffers         └─────────────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │   HuggingFace   │
                                         │  Transformers   │
                                         └─────────────────┘
```

## Files Created

```
invid.ai/
├── proto/
│   └── metadata.proto              # Shared protobuf definition
├── py-server/
│   ├── app/
│   │   ├── grpc_server.py         # gRPC server implementation
│   │   └── generated/             # Generated protobuf code
│   │       └── __init__.py
│   ├── generate_grpc.sh           # Script to generate Python gRPC code
│   ├── run.sh                     # Run both servers
│   └── requirements.txt           # Updated with grpc deps
└── apps/socializer/
    └── src/
        ├── grpc/
        │   ├── client.ts          # gRPC client
        │   └── index.ts           # Module exports
        └── app/api/gemini/
            └── route.ts           # Updated to use gRPC
```
