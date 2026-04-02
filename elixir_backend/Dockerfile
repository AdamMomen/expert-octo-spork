# Build stage
FROM hexpm/elixir:1.15.7-erlang-26.1.2-alpine-3.18.4 AS builder

# Install build dependencies
RUN apk add --no-cache build-base git

WORKDIR /app

# Install hex and rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Copy dependency files
COPY mix.exs ./

# Generate mix.lock and install dependencies
RUN mix deps.get --only prod

# Copy source code
COPY lib ./lib
COPY config ./config

# Compile the application
RUN MIX_ENV=prod mix compile

# Build release
RUN MIX_ENV=prod mix release

# Runtime stage
FROM alpine:3.18.4

# Install runtime dependencies
RUN apk add --no-cache \
    openssl \
    libgcc \
    libstdc++ \
    ncurses-libs

WORKDIR /app

# Copy the release from builder stage
COPY --from=builder /app/_build/prod/rel/integration_test_lab .

# Create non-root user
RUN adduser -D appuser && chown -R appuser /app
USER appuser

# Expose port
EXPOSE 4000

# Environment variables
ENV HOME=/app
ENV MIX_ENV=prod

# Start the application
CMD ["./bin/integration_test_lab", "start"]
