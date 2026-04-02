import { chromium, type Browser, type Page } from 'playwright'
import { join } from 'path'
import { mkdir, writeFile } from 'fs/promises'

interface TestResult {
  success: boolean
  logs: string[]
  error?: string
  screenshotPath?: string
}

export async function runDemoTest(broken: boolean): Promise<TestResult> {
  const logs: string[] = []
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  })
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  })
  
  const page = await context.newPage()
  
  try {
    // Create screenshot directory
    const runDir = join(process.cwd(), 'src', 'integrations', 'runs', Date.now().toString())
    await mkdir(runDir, { recursive: true })
    
    logs.push('Launching browser...')
    logs.push(`Navigating to /demo${broken ? '?broken=true' : ''}...`)
    
    await page.goto(`http://localhost:3000/demo${broken ? '?broken=true' : ''}`)
    
    logs.push('Page loaded, looking for email input...')
    
    if (broken) {
      // This will fail - vendor changed the selector
      const selector = '[data-testid="email-input"]' 
      logs.push(`Attempting to fill: ${selector}`)
      
      try {
        // Short timeout (3s) for broken state - fail fast!
        await page.fill(selector, 'test@example.com', { timeout: 3000 })
        logs.push('Email filled successfully')
      } catch (error) {
        logs.push(`ERROR: Element not found - ${selector}`)
        logs.push('Taking failure screenshot...')
        
        const screenshotPath = join(runDir, 'failure.png')
        await page.screenshot({ path: screenshotPath, fullPage: true })
        
        await browser.close()
        
        return {
          success: false,
          logs,
          error: `Selector not found: ${selector}`,
          screenshotPath
        }
      }
    } else {
      // Working test
      logs.push('Filling email: test@example.com')
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      
      logs.push('Filling password')
      await page.fill('[data-testid="password-input"]', 'password123')
      
      logs.push('Clicking login button...')
      await page.click('[data-testid="login-button"]')
      
      logs.push('Login successful!')
      
      const screenshotPath = join(runDir, 'success.png')
      await page.screenshot({ path: screenshotPath, fullPage: true })
      
      await browser.close()
      
      return {
        success: true,
        logs,
        screenshotPath
      }
    }
    
    await browser.close()
    
    return {
      success: !broken,
      logs
    }
  } catch (error) {
    await browser.close()
    
    return {
      success: false,
      logs,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const broken = process.argv.includes('--broken')
  
  console.log(`Running demo test (broken=${broken})...`)
  
  runDemoTest(broken).then(result => {
    console.log('\n--- RESULT ---')
    console.log('Success:', result.success)
    console.log('Logs:')
    result.logs.forEach(log => console.log(' ', log))
    if (result.error) console.log('Error:', result.error)
    if (result.screenshotPath) console.log('Screenshot:', result.screenshotPath)
    process.exit(result.success ? 0 : 1)
  })
}
