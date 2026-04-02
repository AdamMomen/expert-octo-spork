import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{ 
        background: '#1a1a2e', 
        color: 'white', 
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #333'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🔬 Integration Test Lab</h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>Health checks for your SaaS integrations</p>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Hero Section */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '8px',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0 }}>Demo: Detecting UI Changes</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            See how we catch integration breakages when vendors change their UI.
            Toggle between working and broken states to simulate real-world scenarios.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Link 
              href="/demo-interactive"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6f42c1',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              🚀 Launch Interactive Demo →
            </Link>
            <Link 
              href="/demo"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6c757d',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}
            >
              View Demo Site Only
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#007bff' }}>1. Test Runs</h3>
            <p>Playwright tests check integrations daily or on-demand. When a vendor changes their UI, tests fail immediately.</p>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#007bff' }}>2. AI Analysis</h3>
            <p>Failed test screenshots and logs are sent to Cloudflare AI. It identifies exactly what selector changed.</p>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#007bff' }}>3. Quick Fix</h3>
            <p>Engineers get the suggested selector fix. Update and re-run tests. Integration is healthy again.</p>
          </div>
        </div>

        {/* Test Instructions */}
        <div style={{ 
          background: '#1a1a2e', 
          color: 'white',
          padding: '1.5rem', 
          borderRadius: '8px',
          marginTop: '2rem'
        }}>
          <h3 style={{ marginTop: 0 }}>Run Tests Locally</h3>
          <pre style={{ 
            background: '#2d2d44', 
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '0.9rem'
          }}>
{`# Start the app
npm run dev

# In another terminal, run tests
npm test -- src/integrations/demo-site.spec.ts`}
          </pre>
        </div>
      </div>
    </main>
  )
}
