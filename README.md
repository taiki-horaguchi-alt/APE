# APE - Agri-Profit Engine

農業経営支援プラットフォーム「APE（Agri-Profit Engine）」は、土壌分析、収益シミュレーション、販路マッチングをワンストップで提供するツールです。

感覚に頼りがちな農業経営を、データとシミュレーションでロジカルに変革し、農家の経営判断をサポートします。

## 🌱 プロジェクト概要

| 項目 | 説明 |
|------|------|
| **プロジェクト名** | APE (Agri-Profit Engine) |
| **説明** | 農業経営支援プラットフォーム |
| **バージョン** | 0.1.0 (開発中) |
| **ステータス** | Phase 3 進行中 (60% 完成) |

## ✨ 主な機能

- 📊 **収益シミュレーション** - 作付計画から収益予測まで、複数シナリオを比較検討
- 💰 **コスト分析** - 肥料、農薬、人件費など各種コストを可視化し、利益率を改善
- 📈 **データ管理** - 過去の実績データを蓄積し、経年変化の分析が可能
- 📋 **レポート出力** - 分析結果を PDF/Excel 形式で出力

## 🏗️ プロジェクト構成

```
ape/
├── apps/
│   ├── web/              # Next.js Web アプリ
│   └── mobile/           # Expo React Native アプリ
├── packages/
│   ├── db/               # データベース型定義・マイグレーション
│   ├── eslint-config/    # 共有 ESLint 設定
│   └── typescript-config/ # 共有 TypeScript 設定
├── e2e/                  # Playwright E2E テスト
├── supabase/             # Supabase 設定・マイグレーション
└── scripts/              # ユーティリティスクリプト
```

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15.2.3** - React フレームワーク (Turbopack)
- **React 19** - UI ライブラリ
- **React Native** (Expo) - モバイルアプリ
- **Tailwind CSS** - スタイリング
- **TypeScript 5.7** - 言語
- **Lucide React** - アイコン

### バックエンド・インフラ
- **Supabase** - PostgreSQL + 認証 + リアルタイムDB
- **PostgreSQL 16** - データベース
- **Row Level Security (RLS)** - セキュリティ

### 開発ツール
- **pnpm 9.15.0** - パッケージマネージャー
- **Turbo 2.3.0** - モノレポビルド
- **Playwright 1.58.2** - E2E テスト
- **Node.js >= 20.0.0** - ランタイム

## 📋 セットアップ

### 前提条件
- Node.js 20.0.0 以上
- pnpm 9.15.0

### インストール

```bash
# 依存関係のインストール
pnpm install

# 環境変数の確認
npm run validate

# 開発サーバーの起動
npm run dev

# Web のみ起動
npm run dev:web

# モバイル のみ起動
npm run dev:mobile
```

### 環境変数

```bash
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> ⚠️ `.env.local` と `.env` は `.gitignore` で除外されています。本番環境では環境変数を設定してください。

## 🚀 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Lint チェック
npm run lint

# TypeScript チェック
npm run typecheck

# E2E テスト
npm run test:e2e

# 全検証実行（build + lint + test:e2e）
npm run validate:all

# 環境検証
npm run validate

# キャッシュ削除
npm run clean
```

## 🧪 テスト

### E2E テスト（Playwright）

```bash
# テストの実行
npm run test:e2e

# テストのインストール（初回のみ）
playwright install
```

**テストカバレッジ**: 26個のテストケース
- ✅ ページアクセス検証
- ✅ ナビゲーション検証
- ✅ レスポンシブデザイン検証
- ✅ パフォーマンス検証

## 📁 ディレクトリ構成

### `/apps/web`
Next.js Web アプリケーション
- ダッシュボード
- 栽培記録管理
- 提案書管理
- 請求・納品管理
- メッセージング機能
- 設定画面

### `/apps/mobile`
React Native (Expo) モバイルアプリケーション

### `/packages/db`
共有データベース型定義とマイグレーション
- TypeScript 型定義 (`src/types.ts`)
- Supabase マイグレーション

### `/e2e`
Playwright を使用した E2E テスト

### `/supabase`
Supabase 設定
- RLS ポリシー定義
- マイグレーション管理

## 📚 ドキュメント

- [**DEPLOYMENT_GUIDE.md**](./DEPLOYMENT_GUIDE.md) - 本番環境へのデプロイメント手順
- [**PRODUCTION_SETUP.md**](./PRODUCTION_SETUP.md) - 本番環境セットアップ
- [**TESTING_GUIDE.md**](./TESTING_GUIDE.md) - テスト実行ガイド
- [**IMPLEMENTATION_SUMMARY.md**](./IMPLEMENTATION_SUMMARY.md) - 実装の概要
- [**COMPLETION_STATUS.md**](./COMPLETION_STATUS.md) - プロジェクト完成度レポート
- [**NEXT_STEPS.md**](./NEXT_STEPS.md) - 次のステップガイド

## 🔐 セキュリティ

### 実装済み
- ✅ Supabase Authentication (OAuth)
- ✅ Row Level Security (RLS) ポリシー
- ✅ マルチテナント対応（organization_id による分離）
- ✅ HTTPS 通信
- ✅ 環境変数による秘密鍵管理（.gitignore）

### セキュリティチェック
```bash
npm run validate  # 環境変数の検証
```

## 🌐 デプロイメント

### 推奨デプロイ環境
- **フロントエンド**: Vercel (Next.js 推奨)
- **バックエンド**: Supabase (PostgreSQL + API)

詳細は [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) を参照してください。

## 📊 プロジェクト進捗

| フェーズ | 項目 | 進捗 | 状態 |
|---------|------|------|------|
| Phase 1 | Supabase 統合 | 100% | ✅ 完了 |
| Phase 2 | ドキュメント・テスト準備 | 100% | ✅ 完了 |
| Phase 3 | テスト検証・修正 | 30% | ⏳ 進行中 |
| Phase 4 | 本番環境デプロイ | 0% | ⏹️ 未開始 |

詳細は [COMPLETION_STATUS.md](./COMPLETION_STATUS.md) を参照してください。

## 👤 開発者

**堀口　大樹** (Taiki Horaguchi)

- GitHub: [@taiki-horaguchi-alt](https://github.com/taiki-horaguchi-alt)
- ポートフォリオ: [https://portfolio1-chi-rouge.vercel.app](https://portfolio1-chi-rouge.vercel.app)

## 📝 ライセンス

このプロジェクトはプライベートプロジェクトです。

## 🙏 謝辞

- Supabase チーム
- Next.js チーム
- Playwright チーム

## 📮 サポート

問題や質問がある場合は、以下をご確認ください：

1. [NEXT_STEPS.md](./NEXT_STEPS.md) - よくある質問と回答
2. [TESTING_GUIDE.md](./TESTING_GUIDE.md) - テスト関連の問題
3. GitHub Issues (プライベートリポジトリの場合)

---

**最終更新**: 2026年3月2日
**バージョン**: 0.1.0
