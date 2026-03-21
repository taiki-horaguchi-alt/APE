import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const TEST_EMAIL = 'screenshot-test@example.com'
const TEST_PASSWORD = 'Screenshot123456'

test.describe('APE Screenshots', () => {
  test('Login Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: '../screenshots/01-login-page.png', fullPage: true })
  })

  test('Login Page - Signup Tab', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    // Click signup tab
    await page.click('button:has-text("新規登録")')
    await page.waitForTimeout(500)
    await page.screenshot({ path: '../screenshots/02-signup-tab.png', fullPage: true })
  })

  test('Onboarding - Step 1', async ({ page }) => {
    // First, signup
    await page.goto(`${BASE_URL}/login`)
    await page.click('button:nth-child(2) >> text=新規登録')
    await page.fill('input[type="email"]', `test-${Date.now()}@example.com`)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.locator('button:has-text("新規登録")').last().click()

    // Wait for redirect to onboarding
    await page.waitForURL('**/onboarding')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: '../screenshots/03-onboarding-step1.png', fullPage: true })
  })

  test('Onboarding - Step 2', async ({ page }) => {
    // First, signup and reach onboarding
    await page.goto(`${BASE_URL}/login`)
    await page.click('button:has-text("新規登録")')
    await page.fill('input[type="email"]', `test-${Date.now()}@example.com`)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button:has-text("新規登録"):not(:has-text("新規"))')

    await page.waitForURL('**/onboarding')

    // Fill step 1 and go to step 2
    await page.fill('input[placeholder*="農園"]', 'テスト農園')
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(500)
    await page.screenshot({ path: '../screenshots/04-onboarding-step2.png', fullPage: true })
  })

  test('Onboarding - Step 3', async ({ page }) => {
    // First, signup and reach onboarding
    await page.goto(`${BASE_URL}/login`)
    await page.click('button:has-text("新規登録")')
    await page.fill('input[type="email"]', `test-${Date.now()}@example.com`)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button:has-text("新規登録"):not(:has-text("新規"))')

    await page.waitForURL('**/onboarding')

    // Fill step 1
    await page.fill('input[placeholder*="農園"]', 'テスト農園')
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(500)

    // Fill step 2 - select crops
    await page.click('button:has-text("トマト")')
    await page.click('button:has-text("きゅうり")')
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(500)

    // Screenshot step 3
    await page.screenshot({ path: '../screenshots/05-onboarding-step3.png', fullPage: true })
  })

  test('Demo Data Prompt Modal', async ({ page }) => {
    // First, signup and reach onboarding
    await page.goto(`${BASE_URL}/login`)
    await page.click('button:has-text("新規登録")')
    const email = `test-${Date.now()}@example.com`
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button:has-text("新規登録"):not(:has-text("新規"))')

    await page.waitForURL('**/onboarding')

    // Fill all steps
    await page.fill('input[placeholder*="農園"]', 'デモ農園')
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(300)

    await page.click('button:has-text("トマト")')
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(300)

    await page.click('button:has-text("個人経営")')
    await page.click('button:has-text("専業")')
    await page.click('button:has-text("はじめる")')

    // Wait for modal
    await page.waitForSelector('text=デモデータを読み込みますか')
    await page.waitForTimeout(500)
    await page.screenshot({ path: '../screenshots/06-demo-data-modal.png', fullPage: true })
  })

  test('Dashboard with Demo Data', async ({ page }) => {
    // First, complete onboarding with demo data
    await page.goto(`${BASE_URL}/login`)
    await page.click('button:has-text("新規登録")')
    const email = `test-${Date.now()}@example.com`
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button:has-text("新規登録"):not(:has-text("新規"))')

    await page.waitForURL('**/onboarding')

    // Fill all onboarding steps
    await page.fill('input[placeholder*="農園"]', 'デモ農園')
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(300)

    await page.click('button:has-text("トマト")')
    await page.click('button:has-text("次へ")')
    await page.waitForTimeout(300)

    await page.click('button:has-text("個人経営")')
    await page.click('button:has-text("専業")')
    await page.click('button:has-text("はじめる")')

    // Wait for modal and click load demo data
    await page.waitForSelector('text=デモデータを読み込みますか')
    await page.click('button:has-text("読み込む")')

    // Wait for dashboard
    await page.waitForURL('**/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: '../screenshots/07-dashboard.png', fullPage: true })
  })
})
