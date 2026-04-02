import { NextRequest } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { integrationId = 'demo-login' } = await request.json()
  
  const scriptPath = join(process.cwd(), 'src', 'lib', 'test-runner.ts')
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Run the TypeScript script with integration ID
      const testProcess = spawn('npx', [
        'tsx',
        scriptPath,
        integrationId
      ], {
        cwd: process.cwd(),
        env: process.env
      })
      
      testProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n')
        lines.forEach((line: string) => {
          if (line.trim()) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'log', message: line })}\n\n`))
          }
        })
      })
      
      testProcess.stderr.on('data', (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: data.toString() })}\n\n`))
      })
      
      testProcess.on('close', (code) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', code, integrationId })}\n\n`))
        controller.close()
      })
      
      testProcess.on('error', (err) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`))
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

// Also export the integration list
export async function GET() {
  const { getAllIntegrations } = await import('@/src/lib/integrations/schema')
  
  return Response.json({
    integrations: getAllIntegrations()
  })
}
