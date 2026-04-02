# Protocol implementation for JSON encoding
defimpl Jason.Encoder, for: IntegrationTestLab.Integration do
  def encode(integration, opts) do
    integration
    |> Map.from_struct()
    |> Map.update(:steps, [], fn steps -> 
      Enum.map(steps, &Map.from_struct/1)
    end)
    |> Jason.Encode.map(opts)
  end
end

defimpl Jason.Encoder, for: IntegrationTestLab.Integration.Step do
  def encode(step, opts) do
    step
    |> Map.from_struct()
    |> Jason.Encode.map(opts)
  end
end
