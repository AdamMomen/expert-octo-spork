defmodule IntegrationTestLab.PubSub do
  @moduledoc """
  Wrapper around Phoenix.PubSub for real-time messaging.
  
  Shows: Abstraction, pub/sub patterns
  """
  
  @doc """
  Subscribe to a topic.
  """
  def subscribe(topic) do
    Phoenix.PubSub.subscribe(IntegrationTestLab.PubSub, topic)
  end

  @doc """
  Broadcast a message to all subscribers of a topic.
  """
  def broadcast(topic, message) do
    Phoenix.PubSub.broadcast(IntegrationTestLab.PubSub, topic, message)
  end

  @doc """
  Unsubscribe from a topic.
  """
  def unsubscribe(topic) do
    Phoenix.PubSub.unsubscribe(IntegrationTestLab.PubSub, topic)
  end
end
