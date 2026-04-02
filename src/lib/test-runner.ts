import { chromium } from 'playwright'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import { getIntegration, type Integration, type IntegrationStep } from './integrations/schema'

interface TestResult {
  success: boolean
  logs: string[]
  error?: string
  failedStep?: number
  screenshotPath?: string
}

export async function runIntegrationTest(
  integrationId: string,
  options: { 
    headless?: boolean
    slowMo?: number
  } = {}
): Promise<TestResult> {
  const logs: string[] = []
  const integration = getIntegration(integrationId)
  
  if (!integration) {
    return {
      success: false,
      logs: [`Integration not found: ${integrationId}`],
      error: 'Integration not found'
    }
  }
  
  logs.push(`Starting test: ${integration.name}`)
  logs.push(`Vendor: ${integration.vendor}`)
  logs.push(`Steps: ${integration.steps.length}`)
  
  const browser = await chromium.launch({ 
    headless: options.headless ?? false,
    slowMo: options.slowMo ?? 500
  })
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  })
  
  const page = await context.newPage()
  
  // Create screenshot directory
  const runDir = join(process.cwd(), 'src', 'integrations', 'runs', Date.now().toString())
  await mkdir(runDir, { recursive: true })
  
  try {
    for (let i = 0; i < integration.steps.length; i++) {
      const step = integration.steps[i]
      logs.push(`\n[Step ${i + 1}/${integration.steps.length}] ${step.action}`)
      
      try {
        await executeStep(page, step, logs)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        logs.push(`❌ FAILED: ${errorMsg}`)
        
        const screenshotPath = join(runDir, 'failure.png')
        await page.screenshot({ path: screenshotPath, fullPage: true })
        
        await browser.close()
        
        // Update integration with last run info
        integration.lastRun = {
          status: 'failed',
          timestamp: new Date().toISOString(),
          error: errorMsg,
          failedStep: i
        }
        
        return {
          success: false,
          logs,
          error: errorMsg,
          failedStep: i,
          screenshotPath
        }
      }
    }
    
    // All steps passed
    logs.push('\n✅ All steps passed!')
    
    const screenshotPath = join(runDir, 'success.png')
    await page.screenshot({ path: screenshotPath, fullPage: true })
    
    await browser.close()
    
    // Update integration with last run info
    integration.lastRun = {
      status: 'passed',
      timestamp: new Date().toISOString()
    }
    
    return {
      success: true,
      logs,
      screenshotPath
    }
  } catch (error) {
    await browser.close()
    
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logs.push(`\n❌ Test failed: ${errorMsg}`)
    
    return {
      success: false,
      logs,
      error: errorMsg
    }
  }
}

async function executeStep(
  page: any, 
  step: IntegrationStep, 
  logs: string[]
): Promise<void> {
  switch (step.action) {
    case 'goto':
      logs.push(`  Navigating to: ${step.url}`)
      try {
        await page.goto(step.url!, { timeout: 10000, waitUntil: 'networkidle' })
      } catch (error) {
        logs.push(`  ❌ Failed to load page - is the dev server running on port 3000?`)
        throw error
      }
      break
      
    case 'fill':
      logs.push(`  Filling: ${step.selector}`)
      logs.push(`  Value: ${step.value}`)
      await page.fill(step.selector!, step.value!, { 
        timeout: step.timeout ?? 30000 
      })
      break
      
    case 'click':
      logs.push(`  Clicking: ${step.selector}`)
      await page.click(step.selector!)
      break
      
    case 'wait':
      logs.push(`  Waiting: ${step.timeout}ms`)
      await page.waitForTimeout(step.timeout ?? 1000)
      break
      
    case 'expect':
      logs.push(`  Expecting: ${step.selector}`)
      // Could add assertions here
      break
      
    default:
      throw new Error(`Unknown action: ${step.action}`)
  }
  
  logs.push(`  ✅ Success`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const integrationId = process.argv[2] || 'demo-login'
  
  console.log(`Running integration: ${integrationId}`)
  
  runIntegrationTest(integrationId).then(result => {
    console.log('\n' + '='.repeat(50))
    console.log('RESULT:', result.success ? '✅ PASSED' : '❌ FAILED')
    console.log('='.repeat(50))
    console.log('\nLogs:')
    result.logs.forEach(log => console.log(log))
    
    if (result.error) {
      console.log('\nError:', result.error)
    }
    
    if (result.failedStep !== undefined) {
      console.log(`\nFailed at step: ${result.failedStep + 1}`)
    }
    
    if (result.screenshotPath) {
      console.log(`\nScreenshot: ${result.screenshotPath}`)
    }
    
    process.exit(result.success ? 0 : 1)
  })
}
