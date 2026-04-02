# Multi-service Dockerfile: Next.js + Elixir Backend
# This runs both the TypeScript frontend and Elixir backend in a single container

# ============================================================================
# STAGE 1: Build Elixir Backend
# ============================================================================
FROM hexpm/elixir:1.15.7-erlang-26.1.2-alpine-3.18.4 AS elixir-builder

RUN apk add --no-cache build-base git

WORKDIR /app/elixir

RUN mix local.hex --force && \
    mix local.rebar --force

COPY elixir_backend/mix.exs ./
RUN mix deps.get --only prod

COPY elixir_backend/lib ./lib
COPY elixir_backend/config ./config

RUN MIX_ENV=prod mix compile
RUN MIX_ENV=prod mix release

# ============================================================================
# STAGE 2: Build Next.js Frontend  
# ============================================================================
FROM node:20-alpine AS node-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ============================================================================
# STAGE 3: Runtime - Combined Services
# ============================================================================
FROM alpine:3.18.4

# Install runtime dependencies for both Node and Erlang
RUN apk add --no-cache \
    # Node.js dependencies
    nodejs \
    npm \
    # Erlang/Elixir dependencies
    openssl \
    libgcc \
    libstdc++ \
    ncurses-libs \
    # Process management
    supervisor \
    # Utilities
    bash \
    curl

WORKDIR /app

# Copy Elixir release
COPY --from=elixir-builder /app/elixir/_build/prod/rel/integration_test_lab ./elixir

# Copy Next.js build
COPY --from=node-builder /app/.next ./.next
COPY --from=node-builder /app/package*.json ./
COPY --from=node-builder /app/node_modules ./node_modules
COPY --from=node-builder /app/src ./src
COPY --from=node-builder /app/next.config.js ./
# Copy public directory if it exists
RUN if [ -d "/app/public" ]; then cp -r /app/public ./public; fi

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting Integration Test Lab..."
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
EOF

RUN chmod +x /app/start.sh

# Create non-root user
RUN adduser -D appuser && chown -R appuser /app
USER appuser

# Expose both ports
EXPOSE 3000 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 && curl -f http://localhost:4000/api/integrations || exit 1

# Start both services
CMD ["/app/start.sh"]
