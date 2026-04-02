export default function DemoPage({ 
  searchParams 
}: { 
  searchParams: { broken?: string } 
}) {
  const isBroken = searchParams.broken === 'true'

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ margin: '0 0 1.5rem 0', textAlign: 'center' }}>
          {isBroken ? '🔴 Broken Demo' : '🟢 Demo Site'}
        </h1>

        {isBroken ? (
          // Broken state - selectors will fail
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input 
                type="email"
                data-testid="broken-email"  // Broken selector
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <input 
                type="password"
                data-testid="broken-password"  // Broken selector
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <button
              data-testid="broken-login"  // Broken selector
              style={{ 
                width: '100%',
                padding: '0.75rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Login (Broken)
            </button>
          </>
        ) : (
          // Working state
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input 
                type="email"
                data-testid="email-input"
                placeholder="test@example.com"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <input 
                type="password"
                data-testid="password-input"
                placeholder="password123"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <button
              data-testid="login-button"
              style={{ 
                width: '100%',
                padding: '0.75rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a 
            href={isBroken ? '/demo' : '/demo?broken=true'}
            style={{ color: '#007bff', textDecoration: 'none' }}
          >
            {isBroken ? 'Switch to Working State →' : '← Switch to Broken State'}
          </a>
        </div>

        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          <strong>Test URL:</strong>
          <code style={{ display: 'block', marginTop: '0.5rem' }}>
            {isBroken ? 'http://localhost:3000/demo?broken=true' : 'http://localhost:3000/demo'}
          </code>
        </div>
      </div>
    </div>
  )
}
