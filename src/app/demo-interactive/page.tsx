'use client'

import { useState, useRef, useEffect } from 'react'
import { runTest as runTestApi } from '@/src/lib/api'

interface TestStep {
  action: string
  status: 'pending' | 'running' | 'success' | 'error'
  timestamp: string
}

export default function InteractiveDemo() {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [isBroken, setIsBroken] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'passed' | 'failed'>('idle')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [showAI, setShowAI] = useState(false)
  const consoleRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [logs])

  const runTest = async (broken: boolean) => {
    setIsBroken(broken)
    setIsRunning(true)
    setLogs([])
    setTestStatus('idle')
    setScreenshot(null)
    setShowAI(false)
    
    abortRef.current = new AbortController()
    
    try {
      const integrationId = broken ? 'demo-login-broken' : 'demo-login'
      const response = await runTestApi(integrationId)
      
      if (!response.body) {
        throw new Error('No response body')
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value)
        const lines = text.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'log' || data.type === 'error') {
                setLogs(prev => [...prev, data.message])
              } else if (data.type === 'complete') {
                setTestStatus(data.code === 0 ? 'passed' : 'failed')
                if (broken && data.code !== 0) {
                  setShowAI(true)
                }
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setLogs(prev => [...prev, `Error: ${error.message}`])
        setTestStatus('failed')
      }
    } finally {
      setIsRunning(false)
    }
  }

  const stopTest = () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setIsRunning(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f0f1e',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ 
        background: '#1a1a2e', 
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #2d2d44'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🔬 Integration Health Monitor
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.7 }}>
          Real Playwright tests running in headed mode (visible browser)
        </p>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Control Panel */}
        <div style={{ 
          background: '#1a1a2e',
          border: '1px solid #2d2d44',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Run Live Test</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => runTest(false)}
              disabled={isRunning}
              style={{
                padding: '1rem 2rem',
                background: isRunning ? '#2d2d44' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {isRunning && !isBroken ? '⏳ Running...' : '▶️ Run Working Test'}
            </button>
            
            <button
              onClick={() => runTest(true)}
              disabled={isRunning}
              style={{
                padding: '1rem 2rem',
                background: isRunning ? '#2d2d44' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {isRunning && isBroken ? '⏳ Running...' : '▶️ Run Broken Test'}
            </button>
            
            {isRunning && (
              <button
                onClick={stopTest}
                style={{
                  padding: '1rem 2rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ⏹ Stop
              </button>
            )}
          </div>
          
          <p style={{ margin: '1rem 0 0 0', opacity: 0.6, fontSize: '0.875rem' }}>
            Click to launch a real Chromium browser and watch it execute the test live. 
            You will see the browser window open and perform actions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Console Output */}
          <div style={{ 
            background: '#0a0a14',
            border: '1px solid #2d2d44',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: '#1a1a2e',
              padding: '1rem',
              borderBottom: '1px solid #2d2d44',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>📋 Test Console (Real-time)</h3>
              <span style={{ 
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                background: testStatus === 'passed' ? '#28a745' : 
                           testStatus === 'failed' ? '#dc3545' : 
                           isRunning ? '#ffc107' : '#6c757d',
                color: isRunning ? '#000' : '#fff'
              }}>
                {isRunning ? 'RUNNING' : testStatus === 'idle' ? 'IDLE' : testStatus}
              </span>
            </div>
            
            <div 
              ref={consoleRef}
              style={{ 
                padding: '1rem',
                height: '400px',
                overflowY: 'auto',
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: '0.75rem'
              }}
            >
              {logs.length === 0 ? (
                <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '8rem' }}>
                  Click a button to start Playwright test
                  <br /><br />
                  <span style={{ fontSize: '0.875rem' }}>
                    A real browser window will open and you can watch the test execute
                  </span>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} style={{ 
                    marginBottom: '0.25rem',
                    color: log.includes('error') || log.includes('Error') ? '#dc3545' : '#fff'
                  }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status Panel */}
          <div style={{ 
            background: '#1a1a2e',
            border: '1px solid #2d2d44',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: '#0f0f1e',
              padding: '1rem',
              borderBottom: '1px solid #2d2d44'
            }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>🖥️ Browser Status</h3>
            </div>
            
            <div style={{ 
              padding: '2rem',
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: isBroken ? 'rgba(220, 53, 69, 0.1)' : 'rgba(40, 167, 69, 0.1)'
            }}>
              {isRunning ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '80px',
                    height: '80px',
                    border: '4px solid #2d2d44',
                    borderTop: '4px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem auto'
                  }} />
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Browser is running...</p>
                  <p style={{ opacity: 0.7 }}>Check your screen for the Chromium window</p>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : testStatus === 'idle' ? (
                <div style={{ textAlign: 'center', opacity: 0.5 }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🖥️</div>
                  <p>Ready to launch browser</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: testStatus === 'passed' ? '#28a745' : '#dc3545',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    fontSize: '3rem'
                  }}>
                    {testStatus === 'passed' ? '✅' : '❌'}
                  </div>
                  <p style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold',
                    color: testStatus === 'passed' ? '#28a745' : '#dc3545'
                  }}>
                    Test {testStatus === 'passed' ? 'Passed' : 'Failed'}
                  </p>
                  {testStatus === 'failed' && isBroken && (
                    <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>
                      Vendor changed the UI - selector not found
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        {showAI && (
          <div style={{ 
            marginTop: '2rem',
            background: '#1a1a2e',
            border: '2px solid #6f42c1',
            borderRadius: '12px',
            overflow: 'hidden',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ 
              background: '#6f42c1',
              padding: '1rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>AI Analysis: UI Change Detected</h3>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '2rem',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{ 
                  background: 'rgba(220, 53, 69, 0.2)',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #dc3545'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc3545' }}>❌ Broken Selector</h4>
                  <code style={{ 
                    display: 'block',
                    background: '#0a0a14',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    [data-testid=&quot;email-input&quot;]
                  </code>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
                    Element not found
                  </p>
                </div>
                
                <div style={{ fontSize: '2rem', color: '#6f42c1' }}>→</div>
                
                <div style={{ 
                  background: 'rgba(40, 167, 69, 0.2)',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #28a745'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#28a745' }}>✅ Suggested Fix</h4>
                  <code style={{ 
                    display: 'block',
                    background: '#0a0a14',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    [data-testid=&quot;broken-email&quot;]
                  </code>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
                    Confidence: 95%
                  </p>
                </div>
              </div>
              
              <div style={{ 
                background: '#0a0a14',
                padding: '1.5rem',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>Explanation:</h4>
                <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.9 }}>
                  The vendor changed their login form. The email input was renamed from 
                  email-input to broken-email. This is a common issue when SaaS platforms 
                  update their UI. Without monitoring, this would break your integration silently.
                </p>
              </div>
            </div>
            
            <style>{`
              @keyframes slideIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}
