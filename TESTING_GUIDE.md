# テスト・検証ガイド

**Status:** テスト準備完了
**Date:** 2026-02-25

---

## 📋 概要

本番環境へのデプロイ前に以下の検証を実施します:

1. **本番前チェック** - 環境・設定検証
2. **E2Eテスト** - ユーザーフロー検証
3. **パフォーマンステスト** - 読み込み速度確認

---

## ✅ ステップ1: 本番前チェック

### チェック実行

```bash
cd C:\Users\steam\Dev\Projects\APE

# 本番前チェックスクリプト実行
npx ts-node scripts/production-checklist.ts
```

### 確認項目

```
✅ 環境変数設定
✅ Supabase接続
✅ テーブル構造
✅ RLSポリシー
✅ マスターデータ
✅ 認証システム
```

### 成功時の出力

```
=============================================================
📊 チェック結果

✅ 成功: 15
⚠️  警告: 0
❌ エラー: 0

🎉 すべてのチェックに合格しました！本番環境へのデプロイ準備完了です。
```

---

## 🧪 ステップ2: E2Eテスト実行

### 前提条件

```bash
# 必要なパッケージをインストール
pnpm add -D @playwright/test

# ブラウザをインストール
npx playwright install
```

### 開発サーバー起動

```bash
cd apps/web
pnpm dev
# http://localhost:3000 で起動することを確認
```

### テスト実行

**すべてのテスト実行:**
```bash
npx playwright test e2e/critical-flows.spec.ts
```

**特定のテストのみ実行:**
```bash
# メッセージング機能のテスト
npx playwright test -g "Messages Flow"

# 栽培記録のテスト
npx playwright test -g "Cultivation Records"
```

**UI Mode（推奨）:**
```bash
npx playwright test --ui
```

### テスト項目

| # | テスト名 | 説明 |
|---|---------|------|
| 1️⃣ | Authentication Flow | ユーザー登録・ログイン |
| 2️⃣ | Messages Flow | リアルタイムメッセージング |
| 3️⃣ | Cultivation Records | 栽培記録のCRUD |
| 4️⃣ | Tasks Management | タスク管理・ステータス更新 |
| 5️⃣ | Proposals | 提案書作成・管理 |
| 6️⃣ | Calendar Events | カレンダーイベント |
| 7️⃣ | Materials Management | 資材管理・使用履歴 |
| 8️⃣ | Invoices | 請求書・納品書管理 |
| 9️⃣ | Navigation | ナビゲーション全体 |
| 🔟 | Settings | 設定ページ |

### テスト結果解釈

**PASSED** ✅
```
✓ 1️⃣  Authentication Flow - ユーザー登録とログイン (3.5s)
```
→ テスト成功。その機能は本番環境で使用可能

**FAILED** ❌
```
✗ 2️⃣  Messages Flow - リアルタイムメッセージング
  Error: timeout of 5000ms exceeded waiting for locator('text=テストメッセージ')
```
→ テスト失敗。問題を調査してから再実行

---

## 📊 ステップ3: パフォーマンステスト

### Lighthouseを使用した測定

```bash
# Chrome DevToolsのLighthouseで測定
# 1. ブラウザで http://localhost:3000/dashboard にアクセス
# 2. F12でDevToolsを開く
# 3. Lighthouse タブを選択
# 4. "Analyze page load" をクリック
```

### 目標値

| メトリクス | 目標 | 説明 |
|-----------|------|------|
| Largest Contentful Paint | < 2.5s | 主要コンテンツの読み込み時間 |
| First Input Delay | < 100ms | ユーザー入力への反応時間 |
| Cumulative Layout Shift | < 0.1 | ページのレイアウトシフト |
| Performance Score | > 80 | 総合パフォーマンススコア |

### コマンドラインでの自動測定

```bash
# Playwrightのパフォーマンス測定
npx playwright test -g "Performance"
```

---

## 🔍 ステップ4: ブラウザテスト

### 手動テストチェックリスト

#### ページロード
- [ ] ダッシュボードが3秒以内に読み込まれる
- [ ] すべてのアイコンが正しく表示される
- [ ] レイアウトがズレていない

#### ナビゲーション
- [ ] サイドバーのすべてのリンクが機能している
- [ ] ページ間の遷移がスムーズ
- [ ] 戻るボタンが正しく機能

#### 機能テスト

**メッセージング**
- [ ] メッセージ送受信が可能
- [ ] メッセージがリアルタイムで表示される
- [ ] 未読バッジが正しく更新される

**栽培記録**
- [ ] 新規記録が作成できる
- [ ] 記録がリストに表示される
- [ ] 記録の削除が可能

**タスク管理**
- [ ] タスクが作成できる
- [ ] ステータス更新が可能
- [ ] 優先度が反映される

**その他ページ**
- [ ] 提案書リストが表示される
- [ ] 請求書管理が動作する
- [ ] カレンダーイベントが表示される

#### エラーハンドリング
- [ ] ネットワーク接続切断時にエラー表示
- [ ] エラーメッセージが分かりやすい
- [ ] 再試行オプションがある

#### セキュリティ
- [ ] 他ユーザーのデータが見えない
- [ ] 認証なしでダッシュボードに入れない
- [ ] API応答が組織単位で分離されている

---

## 📱 ステップ5: レスポンシブテスト

### デバイスサイズ確認

| デバイス | 幅 | テスト項目 |
|---------|-----|-----------|
| モバイル | 375px | タッチ操作、レイアウト |
| タブレット | 768px | テキスト読みやすさ |
| デスクトップ | 1440px | 全体レイアウト |

### テスト方法

```bash
# Chrome DevToolsでレスポンシブテスト
# 1. F12でDevToolsを開く
# 2. Ctrl+Shift+M でレスポンシブモード
# 3. 異なるデバイスで確認
```

---

## 🐛 トラブルシューティング

### テストが失敗する場合

#### タイムアウトエラー
```
Error: timeout of 5000ms exceeded waiting for locator
```
**解決:**
1. 要素が実際に表示されているか確認
2. セレクターが正しいか確認
3. タイムアウト値を増やす

#### 接続エラー
```
Error: browser.connect(): net::ERR_CONNECTION_REFUSED
```
**解決:**
1. 開発サーバーが起動しているか確認
2. http://localhost:3000 でアクセス可能か確認

#### 認証エラー
```
Error: Navigation failed because page was closed
```
**解決:**
1. Supabase接続が正常か確認
2. 環境変数が正しく設定されているか確認

---

## 📈 テストレポート生成

### HTMLレポート生成

```bash
# テスト実行とレポート生成
npx playwright test --reporter=html
```

レポート表示:
```bash
npx playwright show-report
```

### JUnitレポート生成

```bash
npx playwright test --reporter=junit --reporter-junit-filename=results.xml
```

---

## ✅ デプロイ前最終チェックリスト

- [ ] 本番前チェック実行 → すべて成功
- [ ] E2Eテスト実行 → すべてパス
- [ ] パフォーマンステスト → 目標値達成
- [ ] ブラウザテスト完了 → 問題なし
- [ ] レスポンシブテスト完了 → 表示OK
- [ ] セキュリティテスト完了 → RLS確認
- [ ] ドキュメント確認 → 最新版

---

## 🚀 本番環境へのデプロイ

すべてのテストが完了した場合:

```bash
# 本番ビルド
pnpm build

# デプロイ (環境に応じて)
# Vercel: vercel deploy --prod
# その他: 環境固有のコマンド
```

---

**参考資料:**
- [Playwright 公式ドキュメント](https://playwright.dev/)
- [Lighthouse パフォーマンス測定](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
