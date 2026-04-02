defmodule IntegrationTestLab.Application do
  @moduledoc """
  OTP Application for Integration Test Lab.
  
  Shows supervision tree patterns:
  - Registry for dynamic process lookup
  - PubSub for real-time messaging
  - Task.Supervisor for concurrent test execution
  """
  
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Registry for dynamic integration processes
      {Registry, keys: :unique, name: IntegrationTestLab.IntegrationRegistry},
      
      # PubSub for real-time test updates
      {Phoenix.PubSub, name: IntegrationTestLab.PubSub},
      
      # GenServer for integration schema storage
      IntegrationTestLab.IntegrationStore,
      
      # Supervisor for test execution tasks
      {Task.Supervisor, name: IntegrationTestLab.TestTaskSupervisor},
      
      # Phoenix Endpoint
      IntegrationTestLabWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: IntegrationTestLab.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    IntegrationTestLabWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
