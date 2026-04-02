// Integration Schema - defines how to test a SaaS integration

export interface IntegrationStep {
  action: 'goto' | 'fill' | 'click' | 'wait' | 'expect'
  selector?: string
  value?: string
  url?: string
  timeout?: number
}

export interface Integration {
  id: string
  name: string
  vendor: string
  steps: IntegrationStep[]
  lastRun?: {
    status: 'passed' | 'failed'
    timestamp: string
    error?: string
    failedStep?: number
  }
}

// Example: Demo Integration
export const demoIntegration: Integration = {
  id: 'demo-login',
  name: 'Demo Site Login',
  vendor: 'DemoCorp',
  steps: [
    {
      action: 'goto',
      url: 'http://localhost:3000/demo'
    },
    {
      action: 'fill',
      selector: '[data-testid="email-input"]',
      value: 'test@example.com'
    },
    {
      action: 'fill',
      selector: '[data-testid="password-input"]',
      value: 'password123'
    },
    {
      action: 'click',
      selector: '[data-testid="login-button"]'
    },
    {
      action: 'wait',
      timeout: 1000
    }
  ]
}

// Broken version (simulates vendor UI change)
export const demoIntegrationBroken: Integration = {
  id: 'demo-login-broken',
  name: 'Demo Site Login (Broken)',
  vendor: 'DemoCorp',
  steps: [
    {
      action: 'goto',
      url: 'http://localhost:3000/demo?broken=true'
    },
    {
      action: 'fill',
      selector: '[data-testid="email-input"]', // This will fail!
      value: 'test@example.com',
      timeout: 3000
    }
  ]
}

// Storage for all integrations
const integrations: Map<string, Integration> = new Map([
  ['demo-login', demoIntegration],
  ['demo-login-broken', demoIntegrationBroken]
])

export function getIntegration(id: string): Integration | undefined {
  return integrations.get(id)
}

export function getAllIntegrations(): Integration[] {
  return Array.from(integrations.values())
}

export function updateIntegration(id: string, integration: Integration): void {
  integrations.set(id, integration)
}

export function updateIntegrationStep(
  integrationId: string, 
  stepIndex: number, 
  updates: Partial<IntegrationStep>
): void {
  const integration = integrations.get(integrationId)
  if (integration && integration.steps[stepIndex]) {
    integration.steps[stepIndex] = { 
      ...integration.steps[stepIndex], 
      ...updates 
    }
  }
}
