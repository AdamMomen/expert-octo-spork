import { NextRequest } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'
import { mkdir, writeFile } from 'fs/promises'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { integrationId = 'demo-login' } = await request.json()
  
  // Create temp test file
  const runId = Date.now().toString()
  const testDir = join(process.cwd(), 'tests', 'runs', runId)
  await mkdir(testDir, { recursive: true })
  
  // Generate test content
  const testContent = generateTestContent(integrationId)
  const testFile = join(testDir, 'test.spec.ts')
  await writeFile(testFile, testContent)
  
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Run Playwright test
      const playwright = spawn('npx', [
        'playwright',
        'test',
        testFile,
        '--reporter=line'
      ], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          HEADLESS: 'true'
        }
      })
      
      playwright.stdout.on('data', (data) => {
        const lines = data.toString().split('\n')
        lines.forEach((line: string) => {
          if (line.trim()) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'log', message: line })}\n\n`))
          }
        })
      })
      
      playwright.stderr.on('data', (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: data.toString() })}\n\n`))
      })
      
      playwright.on('close', (code) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', code })}\n\n`))
        controller.close()
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}

function generateTestContent(integrationId: string): string {
  const isBroken = integrationId.includes('broken')
  
  return `
import { test, expect } from '@playwright/test'

test('${isBroken ? 'broken' : 'working'} login test', async ({ page }) => {
  await page.goto('http://localhost:3000/demo${isBroken ? '?broken=true' : ''}')
  
  ${isBroken ? `
  // This will fail - wrong selector
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  ` : `
  // This will pass
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('[data-testid="login-button"]')
  await expect(page.locator('body')).toContainText('Welcome')
  `}
})
`
}
