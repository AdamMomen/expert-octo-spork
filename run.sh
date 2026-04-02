#!/bin/bash

# Build and run the complete application (Next.js + Elixir) in a single container

echo "🔨 Building Docker image with Next.js frontend + Elixir backend..."
echo "This may take a few minutes..."
echo ""

cd "$(dirname "$0")"

# Build the Docker image
docker build -t integration-test-lab .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting container..."
    echo ""
    echo "Services will be available at:"
    echo "  🎨 Frontend (Next.js):  http://localhost:3000"
    echo "  ⚡ Backend (Elixir):    http://localhost:4000"
    echo ""
    echo "API Endpoints:"
    echo "  GET  http://localhost:4000/api/integrations"
    echo "  POST http://localhost:4000/api/test/run"
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    
    # Run the container
    docker run -p 3000:3000 -p 4000:4000 \
        --name integration-test-lab \
        --rm \
        integration-test-lab
else
    echo ""
    echo "❌ Build failed"
    exit 1
fi
