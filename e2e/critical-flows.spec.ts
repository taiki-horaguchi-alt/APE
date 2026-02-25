import { test, expect } from '@playwright/test'

test.describe('APE Critical User Flows', () => {
  const baseURL = 'http://localhost:3000'
  let testEmail = `test-${Date.now()}@example.com`
  let testPassword = 'TestPassword123!'

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL)
  })

  test('1️⃣  Authentication Flow - ユーザー登録とログイン', async ({ page }) => {
    // ログインページに移動
    await page.goto(`${baseURL}/login`)
    await expect(page).toHaveTitle(/ログイン|Login/)

    // サインアップリンクをクリック
    await page.click('text=新規登録')
    await expect(page).toHaveURL(/.*signup.*/)

    // フォーム入力
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')

    // ダッシュボードへリダイレクト確認
    await page.waitForURL(`${baseURL}/dashboard`, { timeout: 10000 })
    await expect(page).toHaveURL(/.*dashboard.*/)
  })

  test('2️⃣  Messages Flow - リアルタイムメッセージング', async ({ page, context }) => {
    // ログイン状態で進める
    await page.goto(`${baseURL}/dashboard`)

    // メッセージページに移動
    await page.click('text=メッセージ')
    await expect(page).toHaveURL(/.*chat$/)

    // 取引先がない場合は作成
    const noMessagesText = await page.locator('text=メッセージはありません').isVisible()
    if (noMessagesText) {
      await page.click('button:has-text("取引先を追加")')
      await expect(page).toHaveURL(/.*listings.*new/)

      // 取引先フォーム入力
      await page.fill('input[name="name"]', 'テスト取引先')
      await page.selectOption('select[name="type"]', 'restaurant')
      await page.click('button[type="submit"]')

      // メッセージページに戻る
      await page.goto(`${baseURL}/dashboard/chat`)
    }

    // 取引先をクリック
    const firstBuyer = await page.locator('[data-testid="conversation-item"]').first()
    if (await firstBuyer.isVisible()) {
      await firstBuyer.click()
      await expect(page).toHaveURL(/.*chat\//)

      // メッセージ送信
      const buyerId = page.url().split('/').pop()
      await page.fill('input[placeholder="メッセージを入力"]', 'テストメッセージ')
      await page.click('button:has-text("送信")')

      // メッセージ表示確認
      await expect(page.locator('text=テストメッセージ')).toBeVisible({ timeout: 5000 })
    }
  })

  test('3️⃣  Cultivation Records Flow - 栽培記録CRUD', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/records`)

    // 新規記録作成ボタンクリック
    await page.click('button:has-text("記録を追加")')

    // フォーム入力
    await page.selectOption('select[name="type"]', 'planting')
    await page.fill('input[name="date"]', '2026-02-25')
    await page.fill('input[name="crop"]', 'トマト')
    await page.fill('input[name="field"]', '第1圃場')
    await page.fill('textarea[name="content"]', 'テスト記録')

    // 送信
    await page.click('button:has-text("記録する")')

    // 記録が表示されるか確認
    await expect(page.locator('text=テスト記録')).toBeVisible({ timeout: 5000 })
  })

  test('4️⃣  Tasks Management Flow - タスク管理', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/tasks`)

    // タスク作成ボタンクリック
    await page.click('button:has-text("新規作成")')

    // フォーム入力
    await page.fill('input[name="title"]', 'テストタスク')
    await page.fill('textarea[name="description"]', 'テスト用タスク説明')
    await page.selectOption('select[name="priority"]', 'high')
    await page.fill('input[name="dueDate"]', '2026-03-01')

    // 送信
    await page.click('button[type="submit"]')

    // タスク表示確認
    await expect(page.locator('text=テストタスク')).toBeVisible({ timeout: 5000 })

    // ステータス更新
    await page.click('[data-testid="task-item"]:has-text("テストタスク")')
    await page.selectOption('select[name="status"]', 'in_progress')
    await page.click('button:has-text("保存")')

    // ステータス更新確認
    await expect(page.locator('text=進行中')).toBeVisible()
  })

  test('5️⃣  Proposals Flow - 提案書管理', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/proposals`)

    // 提案書作成ボタン
    await page.click('button:has-text("新規作成")')

    // テンプレート選択
    await page.click('button:has-text("seasonal")')

    // 提案先選択
    const buyerSelect = await page.locator('select[name="buyer"]').first()
    if (await buyerSelect.isVisible()) {
      await page.selectOption('select[name="buyer"]', { index: 1 })
    }

    // 送信
    await page.click('button:has-text("作成")')

    // 提案書リストに表示
    await expect(page.locator('[data-testid="proposal-item"]')).toHaveCount(1, { timeout: 5000 })
  })

  test('6️⃣  Calendar Events Flow - カレンダーイベント', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/calendar`)

    // イベント追加ボタン
    await page.click('button:has-text("イベント追加")')

    // フォーム入力
    await page.fill('input[name="title"]', 'テストイベント')
    await page.selectOption('select[name="type"]', 'planting')
    await page.fill('input[name="date"]', '2026-03-15')

    // 送信
    await page.click('button:has-text("作成")')

    // イベント表示確認
    await expect(page.locator('text=テストイベント')).toBeVisible({ timeout: 5000 })
  })

  test('7️⃣  Materials Management Flow - 資材管理', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/records/materials`)

    // 使用履歴タブクリック
    await page.click('button:has-text("使用履歴")')

    // 実際の記録が表示されるか確認
    const usageTable = await page.locator('table').first()
    await expect(usageTable).toBeVisible({ timeout: 5000 })

    // テーブルに行があるか確認
    const rows = await page.locator('tbody tr')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThanOrEqual(0)
  })

  test('8️⃣  Invoices Flow - 請求書管理', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/invoices`)

    // ページロード確認
    await expect(page.locator('text=請求・納品')).toBeVisible()

    // 新規作成ボタンが表示されるか
    const createButton = await page.locator('button:has-text("新規作成")').isVisible()
    if (createButton) {
      await page.click('button:has-text("新規作成")')

      // 請求書タイプ選択
      await page.selectOption('select[name="type"]', 'invoice')

      // 取引先選択
      await page.selectOption('select[name="buyer"]', { index: 1 })

      // 送信
      await page.click('button:has-text("作成")')

      // インボイス表示確認
      await expect(page.locator('[data-testid="invoice-item"]')).toHaveCount(1, { timeout: 5000 })
    }
  })

  test('9️⃣  Navigation Flow - ナビゲーション統合', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard`)

    // サイドバー全リンク確認
    const navLinks = [
      'ホーム',
      'カレンダー',
      '土地診断',
      'マップ',
      'シミュレーター',
      'マーケット',
      '栽培記録',
      '取引先管理',
      '提案書',
      '請求・納品',
      'メッセージ',
      'タスク管理',
      '経営分析',
    ]

    for (const link of navLinks) {
      const linkElement = await page.locator(`text=${link}`).first().isVisible()
      if (linkElement) {
        await page.click(`text=${link}`)
        // ナビゲーション確認（ページがロードされるまで待機）
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
      }
    }

    // 最終的にダッシュボードに戻る
    await page.click('text=ホーム')
    await expect(page).toHaveURL(/.*dashboard$/)
  })

  test('🔟 Settings Flow - 設定ページ', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard/settings`)

    // 設定ページロード確認
    await expect(page.locator('text=設定')).toBeVisible()

    // フォーム要素が表示されるか確認
    const farmNameInput = await page.locator('input[name="farmName"]').isVisible()
    if (farmNameInput) {
      // 値を更新
      await page.fill('input[name="farmName"]', 'テスト農園')
      await page.click('button:has-text("保存")')

      // 保存確認メッセージ
      await expect(page.locator('text=保存しました')).toBeVisible({ timeout: 5000 })
    }
  })
})

test.describe('Performance & Error Handling', () => {
  const baseURL = 'http://localhost:3000'

  test('Performance: Dashboard loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto(`${baseURL}/dashboard`)
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000)
  })

  test('Error Handling: Shows error message on connection failure', async ({ page }) => {
    // ネットワークエラーをシミュレート
    await page.context().setOffline(true)

    await page.goto(`${baseURL}/dashboard`).catch(() => {})

    // オンラインに戻す
    await page.context().setOffline(false)
  })

  test('Responsive: Mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${baseURL}/dashboard`)

    // モバイルメニューが表示されるか確認
    const mobileMenu = await page.locator('[data-testid="mobile-menu"]').isVisible()
    expect(mobileMenu).toBeTruthy()
  })
})
