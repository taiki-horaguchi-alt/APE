# Worker App - セットアップガイド

このドキュメントでは、worker-app プロジェクトをセットアップして実行する方法を説明します。

## 前提条件

- Node.js 20.0.0 以上
- pnpm 9.15.0 以上
- Supabase プロジェクト（PostgreSQL データベース）
- Git

## ステップ 1: 環境準備

### 1.1 Node.js と pnpm のインストール確認

```bash
node --version  # v20.0.0 以上
pnpm --version  # 9.15.0 以上
```

### 1.2 APE プロジェクトディレクトリに移動

```bash
cd c:\Users\steam\Dev\Projects\APE
```

## ステップ 2: モノレポ依存関係のインストール

```bash
# 全アプリの依存関係をインストール
pnpm install

# またはキャッシュをクリアして再インストール
pnpm clean
pnpm install
```

## ステップ 3: Supabase セットアップ

### 3.1 Supabase プロジェクト作成

1. [Supabase Dashboard](https://app.supabase.com) にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト URL と Anon Key を取得

### 3.2 環境変数設定

`.env.local.example` をコピーして `.env.local` を作成：

```bash
cp apps/worker-app/.env.local.example apps/worker-app/.env.local
```

`.env.local` を編集して、Supabase の認証情報を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3.3 データベーステーブル作成

Supabase SQL エディタで以下のマイグレーションを実行：

```bash
# 1. Supabase ダッシュボイン→ SQL Editor を開く
# 2. apps/worker-app/supabase_migrations/00010_foreign_worker_tables.sql の内容をコピー
# 3. SQL エディタに貼り付けて実行
```

または Supabase CLI を使用：

```bash
# インストール
npm install -g supabase

# ログイン
supabase login

# マイグレーション適用
supabase migration up
```

## ステップ 4: 開発サーバー起動

### 4.1 Worker App のみ起動

```bash
pnpm dev:worker

# または
cd apps/worker-app
pnpm dev
```

ブラウザで `http://localhost:3000` にアクセス

### 4.2 全アプリ起動

```bash
pnpm dev
```

- Web アプリ: http://localhost:3001
- Mobile アプリ: http://localhost:3002 (Expo)
- Worker App: http://localhost:3000

## ステップ 5: 動作確認

### 5.1 ダッシュボード表示

http://localhost:3000 にアクセスして、以下が表示されることを確認：

- ウェルカムメッセージ
- 5つのモジュール（作業指示、日報、資材、緊急連絡、天候）

### 5.2 言語切り替え

URL を直接編集して言語を確認：

- http://localhost:3000/ja - 日本語
- http://localhost:3000/vi - ベトナム語
- http://localhost:3000/id - インドネシア語
- http://localhost:3000/tl - タガログ語
- http://localhost:3000/en - 英語

### 5.3 各モジュールの表示確認

- `/dashboard/tasks` - 作業指示一覧
- `/dashboard/reports` - 日報入力
- `/dashboard/materials` - 資材 DB
- `/dashboard/emergency` - 緊急連絡
- `/dashboard/weather` - 天候

## トラブルシューティング

### エラー: `Cannot find module '@ape/shared'`

```bash
# モノレポの設定を確認
pnpm install

# tsconfig を確認
cat tsconfig.json | grep paths

# package.json の workspace フィールドを確認
cat package.json | grep workspaces
```

### エラー: `SUPABASE_URL is not set`

```bash
# .env.local が存在することを確認
ls -la apps/worker-app/.env.local

# 環境変数が正しく設定されていることを確認
cat apps/worker-app/.env.local
```

### エラー: `Port 3000 is already in use`

```bash
# 別のポートで起動
pnpm dev:worker -- -p 3001
```

### PWA が動作しない

1. ブラウザの DevTools を開く
2. Application タブ → Service Workers を確認
3. キャッシュをクリアして再読み込み

```bash
# 本番ビルドで確認（PWA はプロダクション以外では有効にならない）
pnpm build
pnpm start
```

## 次のステップ

### Week 3-4: 作業指示 UI 実装

1. `src/app/[locale]/dashboard/tasks/page.tsx` の UI を改善
2. Supabase から実際のデータを取得
3. 5言語表示の確認

### コード生成のコツ

Claude Code を使用して UI コンポーネントを生成：

```bash
# 1. 要件をコメントで記述
# 2. Claude Code に `planner` エージェントで実装計画を作成
# 3. コンポーネント生成
# 4. `code-reviewer` エージェントで品質確認
```

## 開発環境の最適化

### IDE 設定（VSCode）

`.vscode/settings.json` を作成：

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Prettier 設定

`.prettierrc` を作成：

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## デバッグ

### Chrome DevTools

```bash
# アプリケーションタブで Cookies, LocalStorage, IndexedDB を確認
# Network タブで API リクエストをモニタリング
# Console タブでエラーを確認
```

### ブラウザコンソール

```javascript
// Supabase セッションを確認
const { data } = await supabase.auth.getSession()
console.log(data)

// オフラインモードをテスト
// Chrome DevTools → Network → Offline チェック
```

## 本番ビルド

```bash
# ビルド
pnpm build

# 本番環境で起動
pnpm start

# または Vercel にデプロイ
vercel --prod
```

## 参考資料

- [Next.js ドキュメント](https://nextjs.org/docs)
- [next-intl ドキュメント](https://next-intl-docs.vercel.app/)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [PWA ドキュメント](https://web.dev/progressive-web-apps/)

## サポート

問題が発生した場合は、以下を確認してください：

1. 最新版の依存関係がインストールされているか
2. 環境変数が正しく設定されているか
3. Supabase プロジェクトが正常に動作しているか
4. ポートが使用されていないか

さらなるサポートが必要な場合は、プロジェクト管理者に連絡してください。
