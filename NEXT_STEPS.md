# 次のステップ（Next Steps）

**Status:** 本番環境への準備段階
**Date:** 2026-02-25

---

## 📋 概要

前のセッションで以下が完了：
- ✅ 13 dashboard pages Supabase統合
- ✅ PRODUCTION_SETUP.md、TESTING_GUIDE.md作成
- ✅ 本番前チェックスクリプト作成
- ✅ E2Eテストスイート作成
- ✅ Materials pageバグ修正
- ✅ Git初期化

---

## 🎯 Phase 2: 検証・テスト実行

次の3つのステップを実行して、本番環境への準備状況を確認します。

### Step 1️⃣: 環境検証（2-3分）

開発サーバーが起動している状態で、以下を実行：

```bash
cd C:\Users\steam\Dev\Projects\APE

# 環境変数の設定確認
echo NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# ビルド検証
pnpm build
```

**期待される結果:**
- ✅ ビルド成功（"Compiled successfully"）
- ✅ 環境変数が表示される

**失敗時の対応:**
→ PRODUCTION_SETUP.md の「トラブルシューティング」セクションを参照

---

### Step 2️⃣: 本番前チェック実行（3-5分）

```bash
cd C:\Users\steam\Dev\Projects\APE

# 本番前チェックスクリプト実行
npx ts-node scripts/production-checklist.ts
```

**期待される結果:**
```
=============================================================
📊 チェック結果

✅ 成功: 15以上
⚠️  警告: 0
❌ エラー: 0

🎉 すべてのチェックに合格しました！
```

**チェック内容:**
- 環境変数設定
- Supabase接続
- 14テーブルの存在確認
- RLSポリシー適用確認
- マスターデータ確認
- 認証システム確認

**失敗時の対応:**
1. エラー項目を確認
2. PRODUCTION_SETUP.md で該当セクションの手順を再実行
3. Supabaseダッシュボードで直接確認

---

### Step 3️⃣: E2Eテスト実行（10-15分）

#### 前提条件の確認

```bash
# Playwrightのセットアップ確認
npx playwright --version

# 必要に応じてインストール
pnpm add -D @playwright/test
npx playwright install
```

#### 開発サーバー起動（別ターミナル）

```bash
cd C:\Users\steam\Dev\Projects\APE\apps\web
pnpm dev
# http://localhost:3000 で起動することを確認
```

#### テスト実行

```bash
# すべてのE2Eテスト実行
cd C:\Users\steam\Dev\Projects\APE
npx playwright test e2e/critical-flows.spec.ts

# または UI Mode で実行（推奨）
npx playwright test --ui
```

**期待される結果:**
```
10 passed (45s)

✓ 1️⃣  Authentication Flow
✓ 2️⃣  Messages Flow
✓ 3️⃣  Cultivation Records
... (全10テスト)
```

**テスト項目:**
1. Authentication Flow - ユーザー登録・ログイン
2. Messages Flow - リアルタイムメッセージング
3. Cultivation Records - 栽培記録CRUD
4. Tasks Management - タスク管理
5. Proposals - 提案書管理
6. Calendar Events - カレンダーイベント
7. Materials Management - 資材管理
8. Invoices - 請求書管理
9. Navigation - ナビゲーション統合
10. Settings - 設定ページ

**失敗時の対応:**
1. エラーメッセージを確認
2. TESTING_GUIDE.md の「トラブルシューティング」を参照
3. 該当ページをブラウザで手動テスト

---

## 📊 検証チェックリスト

各ステップ完了後、チェックボックスにマークを入れてください：

- [ ] Step 1️⃣: ビルド成功、環境変数確認
- [ ] Step 2️⃣: 本番前チェック合格
- [ ] Step 3️⃣: E2Eテスト全テスト成功

---

## 🚀 Phase 3: 本番環境セットアップ（次のステップ）

すべての検証テストが成功したら、以下を実行：

```bash
# 1. Supabase CLIのセットアップ
supabase login
supabase link --project-ref your-project-ref

# 2. マイグレーション実行
supabase migration push

# 3. 環境変数の本番設定
# apps/web/.env.local に実際のキーを設定

# 4. 本番ビルド
pnpm build

# 5. デプロイ
# Vercel: vercel deploy --prod
# その他のプラットフォーム: 環境固有のコマンド
```

詳細は `PRODUCTION_SETUP.md` を参照してください。

---

## 📝 トラブルシューティング

各ステップで問題が発生した場合：

| 問題 | ドキュメント |
|------|------------|
| ビルド失敗 | PRODUCTION_SETUP.md - ステップ5 |
| 本番チェック失敗 | PRODUCTION_SETUP.md - トラブルシューティング |
| E2Eテスト失敗 | TESTING_GUIDE.md - トラブルシューティング |

---

## ✅ 現在の状態

**完了済み:**
- ✅ すべての dashboard pages Supabase統合
- ✅ RLSポリシー設定
- ✅ 本番前チェックスクリプト作成
- ✅ E2E テストスイート作成
- ✅ 本番セットアップドキュメント作成

**次に実行すること:**
→ **Phase 2の3つのステップを順番に実行**

1. 環境検証（ビルド確認）
2. 本番前チェック実行
3. E2Eテスト実行

---

**Note:** このガイドに従って進めることで、本番環境へのデプロイが確実に成功します。
各ステップは独立しており、前のステップが完了してから次に進んでください。
