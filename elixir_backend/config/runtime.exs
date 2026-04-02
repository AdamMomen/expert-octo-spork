import Config

# Runtime configuration for production releases

config :integration_test_lab, IntegrationTestLabWeb.Endpoint,
  server: true,
  http: [port: String.to_integer(System.get_env("PORT") || "4000")],
  secret_key_base: System.get_env("SECRET_KEY_BASE") || "your-secret-key-base-for-dev-only-change-in-prod"

# Logging
config :logger, level: :info
