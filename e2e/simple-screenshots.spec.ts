import { test } from '@playwright/test'
import path from 'path'

const BASE_URL = 'http://localhost:3000'
const screenshotsDir = path.join(__dirname, '..', 'screenshots')

test.describe('APE Screenshots', () => {
  test('01 - Login Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    await page.screenshot({
      path: path.join(screenshotsDir, '01-login-page.png'),
      fullPage: true,
    })
  })

  test('02 - Login Page (Signup Tab)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    // Click the signup tab (second button in the tab group)
    await page.locator('button').filter({ hasText: '新規登録' }).nth(0).click()
    await page.waitForTimeout(500)
    await page.screenshot({
      path: path.join(screenshotsDir, '02-login-signup-tab.png'),
      fullPage: true,
    })
  })
})
