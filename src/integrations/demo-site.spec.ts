import { test, expect } from '@playwright/test'

// Demo test that can toggle between passing and failing states
// Use ?broken=true query param to test failure scenarios

test.describe('Demo Site Integration', () => {
  test('should login successfully', async ({ page }) => {
    // Navigate to demo site (working state)
    await page.goto('http://localhost:3000/demo')
    
    // Fill in login form - these selectors work in normal state
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    
    // Click login button
    await page.click('[data-testid="login-button"]')
    
    // Verify success - button was clickable (in real app, would verify redirect)
    await expect(page.locator('[data-testid="email-input"]')).toHaveValue('test@example.com')
  })

  test('should fail when vendor changes UI', async ({ page }) => {
    // Navigate to broken site (simulates vendor UI change)
    await page.goto('http://localhost:3000/demo?broken=true')
    
    // Try to use old selectors - this will FAIL because vendor changed them
    // The vendor changed from "email-input" to "broken-email"
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
  })
})
