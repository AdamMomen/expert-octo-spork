defmodule IntegrationTestLab.TestRunner do
  @moduledoc """
  Service for executing integration tests.
  
  Shows:
  - Port communication with external processes
  - Stream processing
  - Error handling
  - Concurrent execution with Task
  """
  
  require Logger
  alias IntegrationTestLab.IntegrationStore
  alias IntegrationTestLab.PubSub

  @doc """
  Run an integration test asynchronously.
  Returns immediately with a test ID for tracking.
  """
  def run_test(integration_id) do
    test_id = generate_test_id()
    
    # Start test in supervised Task
    Task.Supervisor.start_child(
      IntegrationTestLab.TestTaskSupervisor,
      fn -> do_run_test(test_id, integration_id) end,
      restart: :temporary
    )
    
    {:ok, test_id}
  end

  @doc """
  Execute the actual test logic.
  This runs in a separate process and streams results via PubSub.
  """
  defp do_run_test(test_id, integration_id) do
    Logger.info("Starting test #{test_id} for integration #{integration_id}")
    
    # Subscribe to updates (for potential cancellation)
    PubSub.subscribe("test:#{test_id}")
    
    case IntegrationStore.get_integration(integration_id) do
      {:ok, integration} ->
        # Broadcast test started
        PubSub.broadcast("test:#{test_id}", {:test_started, test_id, integration})
        
        # Execute via Playwright CLI
        result = execute_with_playwright(test_id, integration)
        
        # Update integration with last run
        IntegrationStore.update_last_run(integration_id, %{
          status: if(result.success, do: :passed, else: :failed),
          timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
          error: result.error,
          failed_step: result.failed_step
        })
        
        # Broadcast completion
        PubSub.broadcast("test:#{test_id}", {:test_completed, test_id, result})
        
      {:error, :not_found} ->
        PubSub.broadcast("test:#{test_id}", {:test_error, test_id, "Integration not found"})
    end
  end

  defp execute_with_playwright(test_id, integration) do
    # Generate temp test file
    test_file = generate_test_file(integration)
    
    # Build Playwright command
    cmd = "npx"
    args = [
      "playwright",
      "test",
      test_file,
      "--reporter=line",
      "--workers=1"
    ]
    
    # Spawn process with Port
    port = Port.open({:spawn_executable, System.find_executable(cmd)}, [
      :binary,
      :stderr_to_stdout,
      args: args,
      cd: File.cwd!(),
      env: [{~c"PWTEST_SKIP_TEST_OUTPUT", ~c"1"}]
    ])
    
    # Collect output
    result = collect_output(port, test_id, %{
      success: true,
      logs: [],
      error: nil,
      failed_step: nil
    })
    
    # Cleanup temp file
    File.rm(test_file)
    
    result
  end

  defp collect_output(port, test_id, acc) do
    receive do
      {^port, {:data, data}} ->
        lines = String.split(data, "\n")
        
        new_acc = Enum.reduce(lines, acc, fn line, acc ->
          # Stream each log line via PubSub
          PubSub.broadcast("test:#{test_id}", {:test_log, test_id, line})
          
          # Check for errors
          cond do
            String.contains?(line, "Error:") ->
              %{acc | success: false, error: line}
              
            String.contains?(line, "FAILED") ->
              %{acc | success: false}
              
            true ->
              %{acc | logs: [line | acc.logs]}
          end
        end)
        
        collect_output(port, test_id, new_acc)
        
      {^port, {:exit_status, status}} ->
        # Process exited
        %{acc | 
          success: acc.success and status == 0,
          logs: Enum.reverse(acc.logs)
        }
        
    after
      60_000 ->
        # Timeout
        Port.close(port)
        %{acc | 
          success: false, 
          error: "Test timeout after 60 seconds",
          logs: Enum.reverse(acc.logs)
        }
    end
  end

  defp generate_test_file(integration) do
    test_content = """
    import { test, expect } from '@playwright/test'
    
    test('#{integration.name}', async ({ page }) => {
      #{generate_steps(integration.steps)}
    })
    """
    
    file = Path.join(System.tmp_dir!(), "test_#{:rand.uniform(10000)}.spec.ts")
    File.write!(file, test_content)
    file
  end

  defp generate_steps(steps) do
    Enum.map_join(steps, "\n  ", fn step ->
      case step.action do
        :goto -> 
          timeout = step.timeout || 10000
          "await page.goto('#{step.url}', { timeout: #{timeout} })"
          
        :fill ->
          timeout = step.timeout || 30000
          "await page.fill('#{step.selector}', '#{step.value}', { timeout: #{timeout} })"
          
        :click ->
          "await page.click('#{step.selector}')"
          
        :wait ->
          "await page.waitForTimeout(#{step.timeout || 1000})"
          
        _ ->
          "// Unknown action: #{step.action}"
      end
    end)
  end

  defp generate_test_id do
    :crypto.strong_rand_bytes(8)
    |> Base.encode16(case: :lower)
  end
end
