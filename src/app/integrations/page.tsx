'use client'

import { useState, useEffect } from 'react'
import { getAllIntegrations, type Integration } from '@/src/lib/integrations/schema'

export default function IntegrationManager() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [showFix, setShowFix] = useState(false)

  useEffect(() => {
    // Load integrations
    const ints = getAllIntegrations()
    setIntegrations(ints)
  }, [])

  const runIntegration = async (integrationId: string) => {
    setIsRunning(true)
    setLogs([])
    setShowFix(false)
    
    const response = await fetch('/api/test/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ integrationId })
    })
    
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value)
        const lines = text.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'log') {
                setLogs(prev => [...prev, data.message])
              } else if (data.type === 'complete') {
                setIsRunning(false)
                if (data.code !== 0) {
                  setShowFix(true)
                }
              }
            } catch {}
          }
        }
      }
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔬 Integration Test Manager</h1>
      
      <div style={{ 
        background: '#fff3cd', 
        border: '1px solid #ffc107',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        <strong>⚠️ Prerequisites:</strong> Make sure to run <code>npm run dev</code> in another terminal first!
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Integration List */}
        <div>
          <h2>Integrations</h2>
          {integrations.map(integration => (
            <div 
              key={integration.id}
              onClick={() => setSelectedIntegration(integration)}
              style={{
                padding: '1rem',
                marginBottom: '0.5rem',
                background: selectedIntegration?.id === integration.id ? '#e3f2fd' : '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <strong>{integration.name}</strong>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {integration.vendor} • {integration.steps.length} steps
              </div>
              {integration.lastRun && (
                <div style={{ 
                  marginTop: '0.5rem',
                  color: integration.lastRun.status === 'passed' ? 'green' : 'red',
                  fontSize: '0.75rem'
                }}>
                  Last run: {integration.lastRun.status}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Integration Details */}
        <div>
          {selectedIntegration ? (
            <>
              <h2>{selectedIntegration.name}</h2>
              <p>Vendor: {selectedIntegration.vendor}</p>
              
              <h3>Steps:</h3>
              <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
                {selectedIntegration.steps.map((step, idx) => (
                  <div key={idx} style={{ marginBottom: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {idx + 1}. {step.action}
                    {step.selector && ` → ${step.selector}`}
                    {step.value && ` = "${step.value}"`}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={() => runIntegration(selectedIntegration.id)}
                  disabled={isRunning}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: isRunning ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isRunning ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isRunning ? 'Running...' : 'Run Test'}
                </button>
              </div>

              {/* Logs */}
              {logs.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h3>Execution Log:</h3>
                  <pre style={{ 
                    background: '#1a1a2e', 
                    color: '#fff',
                    padding: '1rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}>
                    {logs.join('\n')}
                  </pre>
                </div>
              )}

              {/* Fix Suggestion */}
              {showFix && selectedIntegration.lastRun?.failedStep !== undefined && (
                <div style={{ 
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#fff3cd',
                  border: '2px solid #ffc107',
                  borderRadius: '4px'
                }}>
                  <h3>🔧 Suggested Fix</h3>
                  <p>
                    Step {selectedIntegration.lastRun.failedStep + 1} failed with selector:
                    <br />
                    <code>{selectedIntegration.steps[selectedIntegration.lastRun.failedStep].selector}</code>
                  </p>
                  <p>
                    <strong>Issue:</strong> Vendor changed the data-testid attribute.
                    <br />
                    <strong>Fix:</strong> Update selector to match new attribute name.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p>Select an integration to view details</p>
          )}
        </div>
      </div>
    </div>
  )
}
