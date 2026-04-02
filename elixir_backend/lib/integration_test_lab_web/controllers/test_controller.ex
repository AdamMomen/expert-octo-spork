defmodule IntegrationTestLabWeb.TestController do
  @moduledoc """
  Controller for running integration tests.
  
  Shows: 
  - RESTful API design
  - Server-Sent Events streaming
  - Error handling
  """
  
  use IntegrationTestLabWeb, :controller
  
  alias IntegrationTestLab.{TestRunner, IntegrationStore, PubSub}

  @doc """
  List all integrations.
  GET /api/integrations
  """
  def index(conn, _params) do
    integrations = IntegrationStore.list_integrations()
    json(conn, %{integrations: integrations})
  end

  @doc """
  Get a single integration.
  GET /api/integrations/:id
  """
  def show(conn, %{"id" => id}) do
    case IntegrationStore.get_integration(id) do
      {:ok, integration} ->
        json(conn, %{integration: integration})
        
      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Integration not found"})
    end
  end

  @doc """
  Run a test with Server-Sent Events streaming.
  POST /api/test/run
  
  Returns SSE stream with real-time test results.
  """
  def run(conn, %{"integration_id" => integration_id}) do
    # Start the test
    {:ok, test_id} = TestRunner.run_test(integration_id)
    
    # Subscribe to test events
    PubSub.subscribe("test:#{test_id}")
    
    # Return SSE stream
    conn
    |> put_resp_header("content-type", "text/event-stream")
    |> put_resp_header("cache-control", "no-cache")
    |> put_resp_header("connection", "keep-alive")
    |> send_chunked(200)
    |> stream_test_results(test_id)
  end

  def run(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "integration_id is required"})
  end

  @doc """
  Update a step in an integration.
  PUT /api/integrations/:id/steps/:step_index
  """
  def update_step(conn, %{"id" => id, "step_index" => step_index} = params) do
    updates = Map.take(params, ["selector", "value", "timeout"])
    
    # Convert string keys to atoms and handle type conversion
    updates = 
      updates
      |> Enum.map(fn 
        {"timeout", val} when is_binary(val) -> {:timeout, String.to_integer(val)}
        {k, v} -> {String.to_atom(k), v}
      end)
      |> Enum.into(%{})
    
    step_idx = String.to_integer(step_index)
    
    case IntegrationStore.update_step(id, step_idx, updates) do
      {:ok, integration} ->
        json(conn, %{integration: integration})
        
      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Integration not found"})
    end
  end

  # Private Functions

  defp stream_test_results(conn, test_id) do
    receive do
      {:test_started, ^test_id, integration} ->
        chunk = format_sse_event("started", %{
          test_id: test_id,
          integration: integration.id,
          message: "Test started"
        })
        
        case chunk(conn, chunk) do
          {:ok, conn} -> stream_test_results(conn, test_id)
          {:error, _reason} -> conn
        end

      {:test_log, ^test_id, message} ->
        chunk = format_sse_event("log", %{message: message})
        
        case chunk(conn, chunk) do
          {:ok, conn} -> stream_test_results(conn, test_id)
          {:error, _reason} -> conn
        end

      {:test_completed, ^test_id, result} ->
        chunk = format_sse_event("completed", %{
          test_id: test_id,
          success: result.success,
          error: result.error,
          failed_step: result.failed_step
        })
        
        chunk(conn, chunk)

      {:test_error, ^test_id, error} ->
        chunk = format_sse_event("error", %{error: error})
        
        chunk(conn, chunk)
        
    after
      60_000 ->
        # Timeout
        chunk(conn, format_sse_event("timeout", %{message: "Test timeout"}))
    end
  end

  defp format_sse_event(event, data) do
    json_data = Jason.encode!(data)
    "event: #{event}\ndata: #{json_data}\n\n"
  end
end
