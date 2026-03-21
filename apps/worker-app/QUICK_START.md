# クイックスタート - Worker App

3 ステップで開発を開始できます。

## 1️⃣ セットアップ（初回のみ）

```bash
# APE ディレクトリに移動
cd c:\Users\steam\Dev\Projects\APE

# 依存関係をインストール
pnpm install

# 環境変数を設定
# apps/worker-app/.env.local ファイルを作成して以下を設定:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key
```

## 2️⃣ 開発サーバー起動

```bash
# Worker App のみ起動
pnpm dev:worker

# または全アプリ起動
pnpm dev
```

ブラウザで `http://localhost:3000` を開く

## 3️⃣ 動作確認

- ✅ ダッシュボード表示
- ✅ 5つのモジュール表示
- ✅ 言語切り替え: `/ja` → `/vi` → `/id` → `/tl` → `/en`

## 📱 言語別 URL

| 言語 | URL |
|------|-----|
| 日本語 | http://localhost:3000/ja |
| ベトナム語 | http://localhost:3000/vi |
| インドネシア語 | http://localhost:3000/id |
| タガログ語 | http://localhost:3000/tl |
| 英語 | http://localhost:3000/en |

## 📋 現在の機能

- ✅ PWA（インストール対応）
- ✅ 5言語対応
- ✅ ダッシュボード
- ✅ 作業指示モジュール（モック）
- ✅ 日報モジュール（モック）
- ✅ 資材 DB モジュール（モック）
- ✅ 緊急連絡モジュール（モック）
- ✅ 天候モジュール（モック）
- ✅ Service Worker（オフライン対応）
- ✅ Supabase テーブル設計

## 🔧 トラブル時

```bash
# キャッシュをクリア
pnpm clean

# 再インストール
pnpm install

# 再起動
pnpm dev:worker
```

## 📚 詳細はこちら

- 詳細セットアップ: `SETUP.md`
- プロジェクト概要: `README.md`
- 実装ステータス: `IMPLEMENTATION_STATUS.md`

---

**次のステップ**: Week 3-4 - 作業指示 UI の実装
