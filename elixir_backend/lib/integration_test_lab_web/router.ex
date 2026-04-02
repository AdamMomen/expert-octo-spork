defmodule IntegrationTestLabWeb.Router do
  @moduledoc """
  Router for the Phoenix API.
  """
  
  use IntegrationTestLabWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug CORSPlug, origin: "*"
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
