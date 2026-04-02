import { NextResponse } from 'next/server'

const ELIXIR_API = 'http://localhost:4000'

export async function GET() {
  try {
    const res = await fetch(`${ELIXIR_API}/api/integrations`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching from Elixir backend:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}
