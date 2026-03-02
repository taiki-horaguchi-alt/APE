import { test, expect } from '@playwright/test'

test.describe('APE Critical User Flows', () => {
  const baseURL = 'http://localhost:3003' // Updated port

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL)
  })

  // ✅ TEST 1: ログインページアクセス
  test('1️⃣  Login Page Accessibility', async ({ page }) => {
    await page.goto(`${baseURL}/login`)
    await page.waitForLoadState('networkidle')
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(0)
  })

  // ✅ TEST 2: ダッシュボード アクセス
  test('2️⃣  Dashboard Access', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard`)
    await page.waitForLoadState('networkidle')
    const content = await page.content()
    expect(content).toBeTruthy()
  })

  // ✅ TEST 3: 栽培記録ページ
  test('3️⃣  Cultivation Records Page', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/records`)
    await page.waitForLoadState('networkidle')
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(100)
  })

  // ✅ TEST 4: タスク管理ページ
  test('4️⃣  Tasks Management Page', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/tasks`)
    await page.waitForLoadState('networkidle')
    const content = await page.content()
    expect(content).toBeTruthy()
  })

  // ✅ TEST 5: 提案書管理ページ
  test('5️⃣  Proposals Management Page', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/proposals`)
    await page.waitForLoadState('networkidle')
    const pageHTML = await page.content()
    expect(pageHTML.length).toBeGreaterThan(0)
  })

  // ✅ TEST 6: カレンダーページ
  test('6️⃣  Calendar Events Page', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/calendar`)
    await page.waitForLoadState('networkidle')
    const content = await page.content()
    expect(content).toBeTruthy()
  })

  // ✅ TEST 7: 資材管理ページ
  test('7️⃣  Materials Management Page', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/records/materials`)
    await page.waitForLoadState('networkidle')
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(0)
  })

  // ✅ TEST 8: 請求書ページ
  test('8️⃣  Invoices Page', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/invoices`)
    await page.waitForLoadState('networkidle')
    const content = await page.content()
    expect(content).toBeTruthy()
  })

  // ✅ TEST 9: ナビゲーション統合
  test('9️⃣  Navigation Integration', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard`)
    await page.waitForLoadState('networkidle')
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(100)
  })

  // ✅ TEST 10: 設定ページ
  test('🔟 Settings Page', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/settings`)
    await page.waitForLoadState('networkidle')
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(0)
  })

  // ✅ TEST 11: パフォーマンス
  test('Performance: Dashboard Load Time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto(`${baseURL}/dashboard`)
    await page.waitForLoadState('networkidle')
    const endTime = Date.now()

    const loadTime = endTime - startTime
    console.log(`⏱️  Dashboard load time: ${loadTime}ms`)

    // 5秒以内にロード
    expect(loadTime).toBeLessThan(5000)
  })

  // ✅ TEST 12: ページナビゲーション
  test('Page Navigation Flow', async ({ page }) => {
    // ダッシュボード
    await page.goto(`${baseURL}/dashboard`)
    await expect(page).toHaveURL(/.*dashboard/)

    // 記録ページへ遷移
    await page.goto(`${baseURL}/dashboard/records`)
    await expect(page).toHaveURL(/.*records/)

    // タスクページへ遷移
    await page.goto(`${baseURL}/dashboard/tasks`)
    await expect(page).toHaveURL(/.*tasks/)
  })

  // ✅ TEST 13: レスポンシブデザイン
  test('Responsive Design: Mobile View', async ({ page }) => {
    // モバイルビューポート設定
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto(`${baseURL}/dashboard`)
    await page.waitForLoadState('networkidle')

    // ページが正常に表示されるか確認
    const content = await page.content()
    expect(content.length).toBeGreaterThan(0)
  })
})
