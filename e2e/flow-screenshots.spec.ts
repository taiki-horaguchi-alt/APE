import { test } from '@playwright/test'
import path from 'path'

const BASE_URL = 'http://localhost:3000'
const screenshotsDir = path.join(__dirname, '..', 'screenshots')

test.describe('APE Flow Screenshots', () => {
  test('03 - Onboarding Step 1 (Farm Name)', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123456'

    // Go to signup
    await page.goto(`${BASE_URL}/login`)
    await page.locator('button').filter({ hasText: '新規登録' }).nth(0).click()
    await page.waitForTimeout(500)

    // Sign up
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)

    // Click signup button (the submit button after password field)
    await page
      .locator('button')
      .filter({ hasText: '新規登録' })
      .last()
      .click()

    // Wait for onboarding
    await page.waitForURL('**/onboarding', { timeout: 10000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Screenshot step 1
    await page.screenshot({
      path: path.join(screenshotsDir, '03-onboarding-step1.png'),
      fullPage: true,
    })
  })

  test('04 - Onboarding Step 2 (Crops)', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123456'

    // Go to signup
    await page.goto(`${BASE_URL}/login`)
    await page.locator('button').filter({ hasText: '新規登録' }).nth(0).click()
    await page.waitForTimeout(500)

    // Sign up
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page
      .locator('button')
      .filter({ hasText: '新規登録' })
      .last()
      .click()

    // Wait for onboarding
    await page.waitForURL('**/onboarding', { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    // Fill step 1 and proceed to step 2
    await page.fill('input[placeholder*="農園"]', 'テスト農園')
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(1000)

    // Screenshot step 2
    await page.screenshot({
      path: path.join(screenshotsDir, '04-onboarding-step2.png'),
      fullPage: true,
    })
  })

  test('05 - Onboarding Step 3 (Style)', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123456'

    // Go to signup
    await page.goto(`${BASE_URL}/login`)
    await page.locator('button').filter({ hasText: '新規登録' }).nth(0).click()
    await page.waitForTimeout(500)

    // Sign up
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page
      .locator('button')
      .filter({ hasText: '新規登録' })
      .last()
      .click()

    // Wait for onboarding
    await page.waitForURL('**/onboarding', { timeout: 10000 })

    // Fill steps 1 and 2
    await page.fill('input[placeholder*="農園"]', 'テスト農園')
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(500)

    // Select crops
    const cropButtons = await page.locator('button').filter({ hasText: /トマト|きゅうり/ })
    if (await cropButtons.count() > 0) {
      await page.locator('button:has-text("トマト")').click()
    }
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(1000)

    // Screenshot step 3
    await page.screenshot({
      path: path.join(screenshotsDir, '05-onboarding-step3.png'),
      fullPage: true,
    })
  })

  test('06 - Demo Data Modal', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123456'

    // Go to signup
    await page.goto(`${BASE_URL}/login`)
    await page.locator('button').filter({ hasText: '新規登録' }).nth(0).click()
    await page.waitForTimeout(500)

    // Sign up
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page
      .locator('button')
      .filter({ hasText: '新規登録' })
      .last()
      .click()

    // Wait for onboarding
    await page.waitForURL('**/onboarding', { timeout: 10000 })

    // Complete all onboarding steps quickly
    await page.fill('input[placeholder*="農園"]', 'デモ農園')
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(300)

    // Select any crop
    try {
      await page.locator('button:has-text("トマト")').click()
    } catch {
      // Skip if crop selection fails
    }
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(300)

    // Select options and submit
    await page.locator('button').filter({ hasText: '個人経営' }).first().click()
    await page.waitForTimeout(200)
    await page.locator('button').filter({ hasText: '専業' }).first().click()
    await page.waitForTimeout(200)

    await page.click('button:has-text("はじめる")')

    // Wait for modal to appear
    await page.waitForSelector('text=デモデータを読み込みますか', { timeout: 10000 })
    await page.waitForTimeout(500)

    // Screenshot modal
    await page.screenshot({
      path: path.join(screenshotsDir, '06-demo-data-modal.png'),
      fullPage: true,
    })
  })

  test('07 - Dashboard with Demo Data', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123456'

    // Go to signup
    await page.goto(`${BASE_URL}/login`)
    await page.locator('button').filter({ hasText: '新規登録' }).nth(0).click()
    await page.waitForTimeout(500)

    // Sign up
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page
      .locator('button')
      .filter({ hasText: '新規登録' })
      .last()
      .click()

    // Wait for onboarding
    await page.waitForURL('**/onboarding', { timeout: 10000 })

    // Complete all onboarding steps
    await page.fill('input[placeholder*="農園"]', 'デモ農園')
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(300)

    try {
      await page.locator('button:has-text("トマト")').click()
    } catch {
      // Skip if crop selection fails
    }
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(300)

    // Select options and submit
    await page.locator('button').filter({ hasText: '個人経営' }).first().click()
    await page.waitForTimeout(200)
    await page.locator('button').filter({ hasText: '専業' }).first().click()
    await page.waitForTimeout(200)

    await page.click('button:has-text("はじめる")')

    // Wait for modal
    await page.waitForSelector('text=デモデータを読み込みますか', { timeout: 10000 })
    await page.waitForTimeout(500)

    // Click load demo data button
    await page.locator('button:has-text("読み込む")').click()

    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Screenshot dashboard
    await page.screenshot({
      path: path.join(screenshotsDir, '07-dashboard.png'),
      fullPage: true,
    })
  })
})
