
import { test, expect } from '@playwright/test'
import { join } from 'path'

test('should login successfully', async ({ page }) => {
  // Navigate to demo site
  await page.goto('http://localhost:3000/demo')
  
  // This should PASS
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  
  
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('[data-testid="login-button"]')
  
  
  // Take screenshot at the end
  await page.screenshot({ 
    path: join('/Users/adam/ghq/github.com/adammomen/expert-octo-spork/tests/runs/1775087275843', 'result.png'),
    fullPage: true 
  })
})
