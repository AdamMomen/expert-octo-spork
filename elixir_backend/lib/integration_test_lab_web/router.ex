defmodule IntegrationTestLabWeb.Router do
  @moduledoc """
  Router for the Phoenix API.
  """
  
  use IntegrationTestLabWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug CORSPlug,
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      headers: ["Authorization", "Content-Type", "Accept", "Origin", "User-Agent", "DNT", "Cache-Control", "X-Mx-ReqToken", "Keep-Alive", "X-Requested-With", "If-Modified-Since", "X-CSRF-Token"],
      expose: ["Content-Type", "X-Request-Id"],
      max_age: 86400
  end

  scope "/api", IntegrationTestLabWeb do
    pipe_through :api

    # Integration management
    get "/integrations", TestController, :index
    get "/integrations/:id", TestController, :show
    put "/integrations/:id/steps/:step_index", TestController, :update_step
    
    # Test execution
    post "/test/run", TestController, :run
  end
end
