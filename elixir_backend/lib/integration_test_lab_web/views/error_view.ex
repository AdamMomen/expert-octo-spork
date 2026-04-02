defmodule IntegrationTestLabWeb.ErrorView do
  @moduledoc """
  Error view for rendering JSON error responses.
  """
  
  # Simple view without using the macro
  def render("500.json", _assigns) do
    %{error: "Internal server error"}
  end

  def render("404.json", _assigns) do
    %{error: "Not found"}
  end

  def render("400.json", _assigns) do
    %{error: "Bad request"}
  end

  def template_not_found(_template, _assigns) do
    %{error: "Unknown error"}
  end
end
