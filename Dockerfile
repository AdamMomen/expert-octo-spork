# Multi-service Dockerfile: Next.js + Elixir Backend
# Force rebuild: v3

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
FROM mcr.microsoft.com/playwright:v1.42.1-jammy AS node-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Install Playwright browsers explicitly
RUN npx playwright install chromium
RUN npx playwright install-deps chromium

# ============================================================================
# STAGE 3: Runtime - Combined Services
# ============================================================================
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libssl3 \
    libncurses5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Elixir release
COPY --from=elixir-builder /app/elixir/_build/prod/rel/integration_test_lab ./elixir

# Copy Next.js build
COPY --from=node-builder /app/.next ./.next
COPY --from=node-builder /app/package*.json ./
COPY --from=node-builder /app/node_modules ./node_modules
COPY --from=node-builder /app/src ./src
COPY --from=node-builder /app/next.config.js ./
# Create public directory (optional)
RUN mkdir -p ./public

# Copy Playwright browsers from builder
COPY --from=node-builder /ms-playwright /ms-playwright

# Set Playwright environment
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create non-root user
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Expose both ports
EXPOSE 3000 4000

# Start both services
CMD ["/app/start.sh"]
