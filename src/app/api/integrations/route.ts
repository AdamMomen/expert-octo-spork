import { NextResponse } from 'next/server'

// Hardcoded integrations for demo
const integrations = [
  {
    id: 'demo-login',
    name: 'Demo Site Login',
    vendor: 'DemoCorp',
    steps: [
      { action: 'goto', url: 'http://localhost:3000/demo' },
      { action: 'fill', selector: '[data-testid="email-input"]', value: 'test@example.com' },
      { action: 'fill', selector: '[data-testid="password-input"]', value: 'password123' },
      { action: 'click', selector: '[data-testid="login-button"]' }
    ],
    lastRun: null
  },
  {
    id: 'demo-login-broken',
    name: 'Demo Site Login (Broken)',
    vendor: 'DemoCorp',
    steps: [
      { action: 'goto', url: 'http://localhost:3000/demo?broken=true' },
      { action: 'fill', selector: '[data-testid="email-input"]', value: 'test@example.com', timeout: 3000 }
    ],
    lastRun: null
  }
]

export async function GET() {
  return NextResponse.json({ integrations })
}
