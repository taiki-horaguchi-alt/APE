# 本番環境セットアップガイド

**Status:** 準備完了
**Date:** 2026-02-25

---

## 📋 前提条件

- [ ] Supabaseアカウント作成済み
- [ ] プロジェクト作成済み
- [ ] プロジェクトRef確認済み
- [ ] Access Token生成済み

---

## 🚀 ステップ1: Supabase CLIのセットアップ

### インストール（未実行の場合）
```bash
npm install -g supabase
```

### Supabaseにログイン
```bash
supabase login
```
プロンプトに従い、Personal Access Tokenを入力してください。

### プロジェクトをリンク
```bash
cd C:\Users\steam\Dev\Projects\APE
supabase link --project-ref your-project-ref
```

> **your-project-ref** を実際のプロジェクトRefに置き換えてください
> 例: `abcdefghijklmno`

---

## 📦 ステップ2: マイグレーション実行

### マイグレーションを確認
```bash
supabase migration list
```

期待される出力:
```
00001_initial_schema.sql
00002_row_level_security.sql
00003_seed_master_data.sql
00004_add_missing_tables.sql
00005_add_proposals_invoices_tables.sql
00006_add_rls_policies_for_new_tables.sql ✨ 新規
```

### マイグレーション実行
```bash
supabase migration push
```

**確認項目:**
- [ ] 000001 - 基本テーブル作成
- [ ] 00002 - RLSポリシー適用
- [ ] 00003 - マスターデータシード
- [ ] 00004 - メッセージ・タスク・イベント・記録テーブル
- [ ] 00005 - 提案書・請求書テーブル
- [ ] 00006 - **新しいRLSポリシー** (messages, tasks, calendar_events, cultivation_records, proposals, invoices)

---

## 🔐 ステップ3: RLSポリシー検証

### Supabaseダッシュボードで確認

1. **Authentication > Policies** に移動
2. 各テーブルに対して以下のポリシーが存在することを確認:

```
✅ messages
  - "Users can view messages in their organization conversations"
  - "Users can insert messages in their organization"
  - "Users can update their own messages"
  - "Users can soft-delete their own messages"

✅ tasks
  - "Users can view organization tasks"
  - "Users can insert tasks for their organization"
  - "Users can update organization tasks"
  - "Users can soft-delete organization tasks"

✅ calendar_events
  - "Users can view organization calendar events"
  - "Users can insert calendar events for their organization"
  - "Users can update organization calendar events"
  - "Users can soft-delete organization calendar events"

✅ cultivation_records
  - "Users can view organization cultivation records"
  - "Users can insert cultivation records for their organization"
  - "Users can update organization cultivation records"
  - "Users can soft-delete organization cultivation records"

✅ proposals
  - "Users can view organization proposals"
  - "Users can insert proposals for their organization"
  - "Users can update organization proposals"
  - "Users can soft-delete organization proposals"

✅ invoices
  - "Users can view organization invoices"
  - "Users can insert invoices for their organization"
  - "Users can update organization invoices"
  - "Users can soft-delete organization invoices"
```

---

## 🔑 ステップ4: 環境変数設定

### `.env.local` を作成/更新

```bash
# 場所: apps/web/.env.local

# Supabaseキーを入力
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### キーを取得

Supabaseダッシュボード:
1. **Settings > API**
2. 以下をコピー:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ✅ ステップ5: ビルド検証

### ローカルビルド
```bash
cd C:\Users\steam\Dev\Projects\APE
pnpm build
```

期待される出力:
```
✓ Compiled successfully
✓ Generating static pages
```

### ビルドが失敗した場合

```bash
# キャッシュ削除
rm -rf .next
pnpm install
pnpm build
```

---

## 🧪 ステップ6: 接続テスト

### テストスクリプト実行
```bash
node scripts/test-supabase-connection.js
```

**テスト項目:**
- [ ] Supabase接続成功
- [ ] 認証機能動作
- [ ] RLSポリシー適用確認
- [ ] データベースアクセス確認

---

## 📱 ステップ7: アプリケーション起動

### 開発サーバー起動
```bash
cd apps/web
pnpm dev
```

### ブラウザで確認
```
http://localhost:3000
```

---

## 🔍 本番チェックリスト

- [ ] マイグレーション全て実行済み
- [ ] RLSポリシー全て適用済み
- [ ] 環境変数設定済み
- [ ] ビルド成功
- [ ] 開発サーバー起動確認
- [ ] ログイン機能動作確認
- [ ] 取引先管理ページ表示確認
- [ ] メッセージ送受信確認
- [ ] 栽培記録作成確認

---

## ⚠️ トラブルシューティング

### 「Connection refused」エラー
```
原因: Supabase URLが間違っている
解決: env.localを確認してください
```

### 「Permission denied」エラー
```
原因: RLSポリシーが正しく設定されていない
解決: Supabaseダッシュボードで各テーブルのポリシーを確認
```

### 「No rows」エラー
```
原因: マスターデータがシードされていない
解決: migration 00003が正しく実行されているか確認
```

---

## 📞 サポート

問題が発生した場合:

1. `IMPLEMENTATION_SUMMARY.md` を確認
2. マイグレーションログを確認: `supabase migration list`
3. Supabaseダッシュボードでテーブル構造を確認
4. ブラウザのコンソールでエラーメッセージを確認

---

**Next:** すべてのチェックが完了したら、E2Eテストを実行してください。
