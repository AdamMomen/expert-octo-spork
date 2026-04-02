# Integration Test Lab

A browser automation idea for testing SaaS integrations at scale. Built with Next.js, TypeScript, and Playwright.

## What It Does

This platform automates end-to-end testing for third-party SaaS integrations. It runs scheduled browser tests, captures screenshots and videos on failures, and provides a dashboard to monitor test health across your integration ecosystem.

**Key Features:**
- 🎭 Playwright-based browser automations for SaaS tools
- 📊 Real-time dashboard showing test status and history
- 🖼️ Automatic artifact capture (screenshots, videos, traces) on failures
- ⏰ Scheduled test execution with cron jobs
- 🤖 AI copilot for debugging broken selectors and suggesting fixes
- 🔄 Concurrent test execution with proper isolation
- 📡 Real-time updates via Server-Sent Events

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Server Components

**Backend:**
- TypeScript/Node.js API routes
- PostgreSQL for persistence
- Playwright for browser automation
- node-cron for scheduling

**Alternative Elixir Implementation:**
- Phoenix framework
- OTP patterns (GenServer, Supervision trees, PubSub)
- Demonstrates fault tolerance and concurrency

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev