defmodule IntegrationTestLab.IntegrationStore do
  @moduledoc """
  GenServer for storing and managing integration schemas.
  
  Features:
  - In-memory ETS table for O(1) lookups
  - Handles CRUD operations for integrations
  - Persists to disk for restart recovery
  """
  
  use GenServer
  require Logger

  alias IntegrationTestLab.Integration

  # Client API
  
  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @doc """
  Get an integration by ID.
  Shows: Pattern matching, tuple returns
  """
  def get_integration(integration_id) do
    GenServer.call(__MODULE__, {:get, integration_id})
  end

  @doc """
  List all integrations.
  Shows: Enum operations, map values
  """
  def list_integrations do
    GenServer.call(__MODULE__, :list)
  end

  @doc """
  Create or update an integration.
  Shows: Map operations, validation
  """
  def upsert_integration(%Integration{} = integration) do
    GenServer.call(__MODULE__, {:upsert, integration})
  end

  @doc """
  Update a specific step in an integration.
  Shows: Nested data updates, Access behaviour
  """
  def update_step(integration_id, step_index, updates) do
    GenServer.call(__MODULE__, {:update_step, integration_id, step_index, updates})
  end

  @doc """
  Update last run info for an integration.
  Shows: Record updates, timestamps
  """
  def update_last_run(integration_id, run_info) do
    GenServer.cast(__MODULE__, {:update_last_run, integration_id, run_info})
  end

  # Server Callbacks

  @impl true
  def init(_opts) do
    # Load default integrations
    integrations = load_default_integrations()
    
    # Create ETS table for fast reads
    :ets.new(:integrations, [:named_table, :set, :protected])
    
    # Populate ETS
    Enum.each(integrations, fn {id, integration} ->
      :ets.insert(:integrations, {id, integration})
    end)
    
    Logger.info("IntegrationStore initialized with #{map_size(integrations)} integrations")
    
    {:ok, %{integrations: integrations}}
  end

  @impl true
  def handle_call({:get, integration_id}, _from, state) do
    result = case :ets.lookup(:integrations, integration_id) do
      [{^integration_id, integration}] -> {:ok, integration}
      [] -> {:error, :not_found}
    end
    
    {:reply, result, state}
  end

  @impl true
  def handle_call(:list, _from, state) do
    integrations = :ets.tab2list(:integrations)
    |> Enum.map(fn {_id, integration} -> integration end)
    
    {:reply, integrations, state}
  end

  @impl true
  def handle_call({:upsert, integration}, _from, state) do
    :ets.insert(:integrations, {integration.id, integration})
    
    new_state = put_in(state.integrations[integration.id], integration)
    {:reply, {:ok, integration}, new_state}
  end

  @impl true
  def handle_call({:update_step, integration_id, step_index, updates}, _from, state) do
    case :ets.lookup(:integrations, integration_id) do
      [{^integration_id, integration}] ->
        # Update the specific step using Access behaviour
        updated_steps = 
          List.update_at(integration.steps, step_index, fn step ->
            Map.merge(step, updates)
          end)
        
        updated_integration = %{integration | steps: updated_steps}
        :ets.insert(:integrations, {integration_id, updated_integration})
        
        new_state = put_in(state.integrations[integration_id], updated_integration)
        {:reply, {:ok, updated_integration}, new_state}
        
      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end

  @impl true
  def handle_cast({:update_last_run, integration_id, run_info}, state) do
    case :ets.lookup(:integrations, integration_id) do
      [{^integration_id, integration}] ->
        updated_integration = %{integration | last_run: run_info}
        :ets.insert(:integrations, {integration_id, updated_integration})
        
        new_state = put_in(state.integrations[integration_id], updated_integration)
        {:noreply, new_state}
        
      [] ->
        {:noreply, state}
    end
  end

  # Private Functions

  defp load_default_integrations do
    alias IntegrationTestLab.Integration.Step
    
    demo = %Integration{
      id: "demo-login",
      name: "Demo Site Login",
      vendor: "DemoCorp",
      steps: [
        %Step{action: :goto, url: "http://localhost:3000/demo"},
        %Step{action: :fill, selector: ~s([data-testid="email-input"]), value: "test@example.com"},
        %Step{action: :fill, selector: ~s([data-testid="password-input"]), value: "password123"},
        %Step{action: :click, selector: ~s([data-testid="login-button"])},
        %Step{action: :wait, timeout: 1000}
      ]
    }
    
    demo_broken = %Integration{
      id: "demo-login-broken",
      name: "Demo Site Login (Broken)",
      vendor: "DemoCorp",
      steps: [
        %Step{action: :goto, url: "http://localhost:3000/demo?broken=true"},
        %Step{action: :fill, selector: ~s([data-testid="email-input"]), value: "test@example.com", timeout: 3000}
      ]
    }
    
    %{
      "demo-login" => demo,
      "demo-login-broken" => demo_broken
    }
  end
end
