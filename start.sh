#!/bin/bash
set -e

echo "🚀 Starting Integration Test Lab..."
echo ""

# Verify browsers are installed
if [ ! -d "/ms-playwright/chromium-"* ]; then
    echo "❌ Chromium not found at /ms-playwright"
    echo "Installing Playwright browsers..."
    cd /app && npx playwright install chromium
fi

echo "✅ Playwright browsers verified"
echo ""

# Start Elixir backend in background
echo "📡 Starting Elixir backend on port 4000..."
./elixir/bin/integration_test_lab start &
ELIXIR_PID=$!

# Wait for Elixir to be ready
echo "⏳ Waiting for Elixir backend..."
for i in {1..30}; do
    if curl -s http://localhost:4000/api/integrations > /dev/null 2>&1; then
        echo "✅ Elixir backend is ready!"
        break
    fi
    sleep 1
done

echo ""
echo "🎨 Starting Next.js frontend on port 3000..."
npm start &
NODE_PID=$!

echo ""
echo "========================================"
echo "✨ Services are running!"
echo "========================================"
echo "Next.js Frontend: http://localhost:3000"
echo "Elixir Backend:   http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for both processes
wait $ELIXIR_PID $NODE_PID
