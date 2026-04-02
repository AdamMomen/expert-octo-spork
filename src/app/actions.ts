'use server'

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function runTests() {
  try {
    const { stdout, stderr } = await execAsync(
      'npx playwright test src/integrations/demo-site.spec.ts --reporter=json',
      { timeout: 60000 }
    )
    
    // Parse results
    const results = JSON.parse(stdout)
    return {
      success: true,
      stats: {
        total: results.stats?.tests || 0,
        passed: results.stats?.expected || 0,
        failed: results.stats?.unexpected || 0
      },
      suites: results.suites || []
    }
  } catch (error: any) {
    // Playwright returns non-zero exit code on test failure
    // but we still want to parse the results
    try {
      const output = error.stdout || error.message
      const jsonMatch = output.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const results = JSON.parse(jsonMatch[0])
        return {
          success: false,
          stats: {
            total: results.stats?.tests || 0,
            passed: results.stats?.expected || 0,
            failed: results.stats?.unexpected || 0
          },
          suites: results.suites || [],
          error: error.stderr || error.message
        }
      }
    } catch {}
    
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getTestOutput() {
  // Simple mock for now - just return empty
  return []
}
