import { NextResponse } from 'next/server'

const ELIXIR_API = 'http://localhost:4000'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Forward to Elixir backend
    const res = await fetch(`${ELIXIR_API}/api/test/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    // Stream the response back
    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error running test:', error)
    return NextResponse.json(
      { error: 'Failed to run test' },
      { status: 500 }
    )
  }
}
