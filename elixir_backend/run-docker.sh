#!/bin/bash

# Build and run Elixir backend in Docker

echo "🔨 Building Elixir backend Docker image..."
cd "$(dirname "$0")"

# Build the Docker image
docker build -t elixir-integration-test-lab .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting container..."
    echo "API will be available at: http://localhost:4000"
    echo ""
    echo "Test with:"
    echo "  curl http://localhost:4000/api/integrations"
    echo ""
    
    # Run the container
    docker run -p 4000:4000 \
        --name elixir-backend \
        --rm \
        elixir-integration-test-lab
else
    echo "❌ Build failed"
    exit 1
fi
