# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
use Mix.Config

config :integration_test_lab, IntegrationTestLabWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "your-secret-key-base-here-should-be-64-bytes-long-for-production",
  render_errors: [view: IntegrationTestLabWeb.ErrorView, accepts: ~w(json), layout: false],
  pubsub_server: IntegrationTestLab.PubSub,
  live_view: [signing_salt: "another-secret-salt"]

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

import_config "#{Mix.env()}.exs"
