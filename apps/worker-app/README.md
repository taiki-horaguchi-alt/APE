# Worker App - 外国人農業労働者向けマルチ言語PWAアプリ

外国人農業労働者向けの多言語SaaSアプリケーション。日本の農業法人が外国人労働者を管理・指示するためのプラットフォーム。

**対応言語**: ベトナム語、インドネシア語、タガログ語、英語、日本語

## 特徴

- **視覚的作業指示**: 画像・ステップバイステップの指示（多言語対応）
- **日報入力**: アイコン選択式の簡易日報、音声メモ機能
- **農薬・資材DB**: QRコードスキャン → 使用方法（多言語表示）
- **緊急連絡**: ワンタップ通話、位置情報送信
- **天候記録**: 自動天候取得、熱中症警報（WBGT指数）
- **オフライン対応**: Service Worker で完全オフライン動作
- **PWA**: インストール不要、すべてのデバイスで動作

## 技術スタック

- **フレームワーク**: Next.js 15 + React 19
- **言語**: TypeScript
- **スタイル**: Tailwind CSS
- **国際化**: next-intl（5言語対応）
- **バックエンド**: Supabase（PostgreSQL）
- **認証**: Supabase Auth
- **オフライン**: Service Worker + IndexedDB

## ディレクトリ構造

```
worker-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── globals.css         # グローバルスタイル
│   │   ├── [locale]/           # 言語ベースのルーティング
│   │   │   ├── layout.tsx      # 言語別レイアウト
│   │   │   ├── page.tsx        # ダッシュボード
│   │   │   └── dashboard/
│   │   │       ├── tasks/      # 作業指示
│   │   │       ├── reports/    # 日報入力
│   │   │       ├── materials/  # 農薬DB
│   │   │       ├── emergency/  # 緊急連絡
│   │   │       └── weather/    # 天候
│   ├── i18n/
│   │   ├── vi.json            # ベトナム語
│   │   ├── id.json            # インドネシア語
│   │   ├── tl.json            # タガログ語
│   │   ├── en.json            # 英語
│   │   └── ja.json            # 日本語
│   └── lib/
│       ├── supabase/          # Supabase クライアント
│       └── offline/           # オフライン同期
├── public/
│   ├── manifest.json          # PWA マニフェスト
│   ├── sw.js                  # Service Worker
│   └── icons/                 # アイコン
├── supabase_migrations/        # DB マイグレーション
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── middleware.ts              # next-intl ミドルウェア
└── i18n.config.ts            # i18n 設定
```

## セットアップ

### 前提条件
- Node.js 20+
- pnpm 9.15.0+

### インストール

```bash
# APE ディレクトリから実行
pnpm install

# 開発サーバー起動（worker-app のみ）
pnpm dev:worker

# または全アプリ起動
pnpm dev
```

### 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Supabase の認証情報を設定してください。

```bash
cp .env.local.example .env.local
```

### Supabase マイグレーション適用

```bash
# APE ルートディレクトリから
supabase migration up
```

## 開発フロー

### Week 1-2: プロジェクトセットアップ ✅
- [x] Next.js + TypeScript セットアップ
- [x] PWA 設定（manifest.json、service worker）
- [x] next-intl セットアップ（5言語）
- [x] Supabase テーブル設計
- [ ] モックデータ用ダッシュボード UI

### Week 3-4: 作業指示 UI 実装
- [ ] 作業指示一覧ページ
- [ ] 作業指示詳細・ステップ表示
- [ ] 完了マーク機能
- [ ] 5言語表示確認

### Week 5-6: 日報入力 UI 実装
- [ ] 日報入力フォーム
- [ ] アイコン選択式（天候、作業種類）
- [ ] 写真添付機能
- [ ] 音声メモ機能

### Week 7-8: 農薬 DB スキャン
- [ ] QR コードスキャン実装
- [ ] 製品情報表示
- [ ] 安全情報（多言語）
- [ ] 使用回数カウント

### Week 9-10: 緊急連絡 + 天候
- [ ] 緊急連絡先リスト
- [ ] ワンタップ通話
- [ ] GPS 位置情報
- [ ] 天候自動取得
- [ ] 熱中症警報

### Week 11-12: オフライン同期 + テスト + デプロイ
- [ ] オフライン データ保存
- [ ] 同期ロジック
- [ ] ユニット テスト
- [ ] E2E テスト
- [ ] Vercel デプロイ

## 多言語対応

### 翻訳ワークフロー

1. **Phase 1**: Google Translate 自動翻訳 + ネイティブレビュー（外注：¥5万/言語）
2. **Phase 2**: Claude API による文脈を考慮した翻訳
3. **Phase 3**: ユーザーフィードバック機能で継続改善

### 言語切り替え

URL レベルで言語を切り替え:
- `/ja` - 日本語
- `/vi` - ベトナム語
- `/id` - インドネシア語
- `/tl` - タガログ語
- `/en` - 英語

## パフォーマンス目標

- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5秒
- **Bundle Size**: < 200KB（JS）

## セキュリティ

- Supabase Row Level Security (RLS) で認可制御
- HTTPS のみ通信
- ユーザー入力のバリデーション
- API レート制限（Supabase 標準）

## トラブルシューティング

### ローカル開発時のエラー

```bash
# node_modules をクリア
pnpm clean

# 再インストール
pnpm install

# 開発サーバー再起動
pnpm dev:worker
```

### Supabase 接続エラー

`.env.local` の認証情報を確認してください。

### PWA が動作しない

Service Worker が登録されているか確認:
```bash
# DevTools -> Application -> Service Workers
```

## ライセンス

プロプライエタリ（内部使用のみ）

## 連絡先

開発チーム: claude-code@example.com
