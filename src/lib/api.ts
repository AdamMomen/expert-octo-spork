// API Configuration
// Uses Next.js API routes that proxy to Elixir backend

export async function fetchIntegrations() {
  const res = await fetch('/api/integrations')
  if (!res.ok) throw new Error('Failed to fetch integrations')
  return res.json()
}

export async function runTest(integrationId: string) {
  const res = await fetch('/api/test/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ integration_id: integrationId })
  })
  
  if (!res.ok) throw new Error('Failed to run test')
  return res
}
