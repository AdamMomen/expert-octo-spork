defmodule IntegrationTestLab.Integration do
  @moduledoc """
  Schema for integration definitions.
  Shows: Structs, typespecs, documentation
  """
  
  alias __MODULE__.Step

  @type t :: %__MODULE__{
    id: String.t(),
    name: String.t(),
    vendor: String.t(),
    steps: [Step.t()],
    last_run: map() | nil
  }
  
  defstruct [:id, :name, :vendor, :steps, :last_run]
end

defmodule IntegrationTestLab.Integration.Step do
  @moduledoc """
  Individual step in an integration test.
  """
  
  @type action :: :goto | :fill | :click | :wait | :expect
  
  @type t :: %__MODULE__{
    action: action(),
    selector: String.t() | nil,
    value: String.t() | nil,
    url: String.t() | nil,
    timeout: integer() | nil
  }
  
  defstruct [:action, :selector, :value, :url, :timeout]
end
