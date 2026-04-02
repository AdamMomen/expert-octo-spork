
import { test, expect } from '@playwright/test'
import { join } from 'path'

test('should fail when vendor changes UI', async ({ page }) => {
  // Navigate to demo site
  await page.goto('http://localhost:3000/demo?broken=true')
  
  // This will FAIL - vendor changed the selector
  await page.fill('[data-testid="broken-email"]', 'test@example.com')
  
  
  
  // Take screenshot at the end
  await page.screenshot({ 
    path: join('/Users/adam/ghq/github.com/adammomen/expert-octo-spork/tests/runs/1775087281010', 'result.png'),
    fullPage: true 
  })
})
