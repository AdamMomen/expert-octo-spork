# Integration Test Lab

An intelligent integration health monitoring system that automatically detects and diagnoses UI changes in SaaS integrations.

## 🎯 Use Case

**Problem:** Access Owl manages 300+ SaaS integrations. When vendors (Slack, Notion, etc.) change their UI:
- Integration scripts break silently
- Manual debugging takes hours
- Offboarding workflows fail
- Compliance risks (SOC2/ISO27001 violations)

**Solution:** Automated health monitoring with AI-powered diagnosis
- Run tests daily or on-demand
- Detect UI changes within minutes
- AI identifies exactly what selector changed
- Engineers get suggested fixes instantly

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐          ┌─────────────────────────────┐
│   USER INTERFACE    │          │      BACKEND SERVICES       │
│                     │          │                             │
│  ┌───────────────┐  │          │  ┌─────────────────────┐   │
│  │   Next.js     │  │◄────────►│  │   Phoenix API       │   │
│  │   Frontend    │  │   HTTP   │  │   (Elixir)          │   │
│  │               │  │          │  │                     │   │
│  │  /demo        │  │          │  │  - IntegrationStore │   │
│  │  /integrations│  │          │  │  - TestRunner       │   │
│  │  /demo-       │  │          │  │  - PubSub           │   │
│  │   interactive │  │          │  └─────────────────────┘   │
│  └───────────────┘  │          │                             │
└─────────────────────┘          │  ┌─────────────────────┐   │
                                 │  │   Demo Site         │   │
                                 │  │   (Next.js)         │   │
                                 │  │                     │   │
                                 │  │  - Working State    │   │
                                 │  │  - Broken State     │   │
                                 │  └─────────────────────┘   │
                                 │                             │
                                 │  ┌─────────────────────┐   │
                                 │  │   Test Execution    │   │
                                 │  │   (Playwright)      │   │
                                 │  │                     │   │
                                 │  │  - Real browser     │   │
                                 │  │  - Screenshots      │   │
                                 │  │  - Logs             │   │
                                 │  └─────────────────────┘   │
                                 │                             │
                                 └─────────────────────────────┘

Deployment Options:
┌─────────────────────────────────────────────────────────────┐
│  Single Container (Docker)                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Port 3000: Next.js Frontend (Public)                │  │
│  │  Port 4000: Elixir Backend (Internal)                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Server-Sent Events** | Real-time test result streaming |
| **CSS-in-JS** | Inline styling for components |

### Backend (Elixir)
| Technology | Purpose |
|------------|---------|
| **Phoenix 1.7** | Web framework for REST API |
| **GenServer** | State management with ETS tables |
| **Task.Supervisor** | Concurrent test execution |
| **Phoenix.PubSub** | Real-time messaging |
| **Ports** | Communication with Playwright |

### Alternative Backend (TypeScript)
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | REST endpoints |
| **Node.js Streams** | SSE for real-time updates |
| **Child Process** | Spawning Playwright |

### Testing
| Technology | Purpose |
|------------|---------|
| **Playwright** | Browser automation |
| **Chromium** | Headed/headless browser execution |

## 🚀 Quick Start

### Option 1: Single Docker Container (Recommended)

```bash
# Build and run both services
./run.sh

# Or manually
docker build -t integration-test-lab .
docker run -p 3000:3000 integration-test-lab
```

Access:
- Frontend: http://localhost:3000
- API: http://localhost:4000 (internal)

### Option 2: Development Mode

**Terminal 1 - Next.js Frontend:**
```bash
npm install
npm run dev
```

**Terminal 2 - Elixir Backend:**
```bash
cd elixir_backend
mix deps.get
mix phx.server
```

Access:
- Frontend: http://localhost:3000
- API: http://localhost:4000

## 📊 Demo Flow

### 1. Working Integration
```
User clicks "Run Working Test"
    ↓
Frontend calls POST /api/test/run
    ↓
Elixir backend spawns supervised task
    ↓
Playwright launches browser
    ↓
Navigates to /demo
    ↓
Fills login form successfully
    ↓
Returns: ✅ PASSED
```

### 2. Broken Integration (Simulating Vendor Change)
```
User clicks "Run Broken Test"
    ↓
Frontend calls POST /api/test/run
    ↓
Elixir backend spawns supervised task
    ↓
Playwright navigates to /demo?broken=true
    ↓
Tries to fill "email-input" selector
    ↓
Element not found (vendor changed to "broken-email")
    ↓
Returns: ❌ FAILED
    ↓
AI Analysis: "Update selector to [data-testid='broken-email']"
```

## 🔧 Key Features

### Integration Schema
Each integration is defined as a sequence of steps:

```elixir
%Integration{
  id: "demo-login",
  name: "Demo Site Login",
  steps: [
    %{action: :goto, url: "http://localhost:3000/demo"},
    %{action: :fill, selector: "[data-testid='email-input']", value: "test@example.com"},
    %{action: :click, selector: "[data-testid='login-button']"}
  ]
}
```

### Real-time Streaming
Tests stream results via Server-Sent Events:
- Browser launch
- Each step execution
- Success/failure status
- Screenshots on failure

### AI-Powered Diagnosis
When a test fails:
1. Captures screenshot of failure state
2. Identifies which step failed
3. Suggests selector fixes
4. Shows before/after comparison

## 🏆 Why This Architecture?

### Elixir Advantages
| Feature | Benefit |
|---------|---------|
| **Concurrency** | Run 1000+ tests simultaneously |
| **Fault Tolerance** | One crashing test doesn't affect others |
| **Memory Efficiency** | 2KB per process vs 10MB in Node |
| **Hot Reloading** | Deploy without stopping tests |
| **Pattern Matching** | Elegant error handling |

### TypeScript Advantages
| Feature | Benefit |
|---------|---------|
| **Familiarity** | JavaScript ecosystem |
| **Type Safety** | Compile-time error catching |
| **Frontend/Backend** | Shared code between layers |
| **Tooling** | Excellent IDE support |

## 🌐 Deployment

### Coolify (Recommended)
```yaml
# Coolify Configuration
Port: 3000
Healthcheck: http://localhost:3000
Domain: your-domain.com
```

### Docker
```bash
docker build -t integration-test-lab .
docker run -p 3000:3000 integration-test-lab
```

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/integrations` | GET | List all integrations |
| `/api/integrations/:id` | GET | Get specific integration |
| `/api/integrations/:id/steps/:index` | PUT | Update a step |
| `/api/test/run` | POST | Run test (SSE stream) |

## 🎓 Learning Resources

### For Elixir
- **GenServer**: State management with automatic recovery
- **Supervisor**: Process tree management
- **Task**: Concurrent execution
- **Port**: External process communication

### For TypeScript
- **Next.js App Router**: File-based routing
- **Server Components**: Server-side rendering
- **Server-Sent Events**: Real-time streaming

## 🤝 Contributing

This project demonstrates:
- Production-ready Elixir/OTP patterns
- Full-stack TypeScript development
- Docker containerization
- Real-time web applications

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for Access Owl Interview**
