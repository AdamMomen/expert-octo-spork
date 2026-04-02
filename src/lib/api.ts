// API Configuration
// Determines whether to use TypeScript or Elixir backend

const USE_ELIXIR = process.env.NEXT_PUBLIC_USE_ELIXIR_BACKEND === 'true' || true
const ELIXIR_URL = process.env.NEXT_PUBLIC_ELIXIR_API_URL || 'http://localhost:4000'

export const API_BASE_URL = USE_ELIXIR ? ELIXIR_URL : ''

export async function fetchIntegrations() {
  const url = USE_ELIXIR 
    ? `${API_BASE_URL}/api/integrations`
    : '/api/integrations'
    
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch integrations')
  return res.json()
}

export async function runTest(integrationId: string) {
  const url = USE_ELIXIR
    ? `${API_BASE_URL}/api/test/run`
    : '/api/test/run'
    
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ integration_id: integrationId })
  })
  
  if (!res.ok) throw new Error('Failed to run test')
  return res
}
