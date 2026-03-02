# 🌱 APE デモデータセットアップガイド

APE にサンプルデータを入力して、実際の操作を体験できるようにするためのガイドです。

## 📋 目次

1. [前提条件](#前提条件)
2. [テストユーザーの作成](#テストユーザーの作成)
3. [デモデータの生成](#デモデータの生成)
4. [アプリケーションの起動](#アプリケーションの起動)
5. [よくある質問](#よくある質問)

---

## 前提条件

- APE 開発環境がセットアップ済み（`pnpm install` 完了）
- Supabase プロジェクトが設定済み
- 環境変数（`.env.local`）が設定済み

---

## テストユーザーの作成

### 方法 1: Supabase ダッシュボード（推奨）

1. **Supabase ダッシュボードにアクセス**
   - https://app.supabase.com にアクセス
   - プロジェクトを選択

2. **左メニューから「Authentication」を選択**
   - Users タブに移動

3. **「Create a new user」をクリック**
   - Email: `demo@example.com`
   - Password: `DemoPassword123!`（安全なパスワード）
   - Auto confirm user をチェック ✅

4. **ユーザーを作成**
   - 「Create user」をクリック

5. **User ID をコピー**
   - 作成されたユーザーの詳細から UUID をコピー（後で使用）

### 方法 2: APE ログイン画面から登録

1. アプリケーションを起動（手順は後述）
2. `/login` ページで「無料で始める」をクリック
3. メールアドレスで新規登録
4. 確認メールを確認（ローカル開発環境の場合は Supabase ダッシュボードで確認）

---

## デモデータの生成

デモデータを生成するスクリプトを使用します。

### ステップ 1: 環境変数を確認

```bash
# .env.local が正しく設定されているか確認
cat apps/web/.env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
```

### ステップ 2: デモデータを生成

```bash
# プロジェクトルートで実行
npm run seed:demo
```

**出力例:**
```
🌱 APE Demo Data Seeding Started...

📊 Creating demo organization...
✅ Organization created: 550e8400-e29b-41d4-a716-446655440000

🌾 Creating cultivation records...
✅ 4 cultivation records created

🏪 Creating buyers (trading partners)...
✅ 4 buyers created

💬 Creating messages...
✅ 3 messages created

✅ Creating tasks...
✅ 4 tasks created

📄 Creating proposals...
✅ 2 proposals created

🧾 Creating invoices...
✅ 2 invoices created

✨ Demo data seeding completed successfully!

📝 Summary:
  - Organization ID: 550e8400-e29b-41d4-a716-446655440000
  - Cultivation Records: 4
  - Buyers: 4
  - Tasks: 4

🚀 You can now log in and explore the demo data!
```

---

## アプリケーションの起動

### ステップ 1: 開発サーバーを起動

```bash
# Web アプリケーションのみ起動（推奨）
npm run dev:web

# または全アプリケーション起動
npm run dev
```

**出力例:**
```
> ape@0.1.0 dev:web
> turbo run dev --filter=@ape/web

✨ Built in 3.2s

▲ Next.js 15.2.3 (Turbopack)

  Local:        http://localhost:3003
  Environments: .env.local

✓ Ready in 1.2s
```

### ステップ 2: ブラウザで開く

- **URL**: http://localhost:3003（ポートは環境に応じて異なります）
- **ログイン**:
  - Email: `demo@example.com`
  - Password: `DemoPassword123!`

### ステップ 3: ダッシュボードを確認

ログイン後、以下のデータが表示されます：

#### 🌾 栽培記録（Dashboard > Cultivation Records）
- **4つの栽培記録**
  - トマト（畑 A）- ステータス: 成長中
  - ナス（畑 B）- ステータス: 収穫中
  - キュウリ（畑 C）- ステータス: 完了
  - ピーマン（畑 D）- ステータス: 準備中

#### 🏪 取引先管理（Dashboard > Listings）
- **4つの取引先**
  - 大阪青果市場（卸売業者）
  - スーパー野菜館（小売業者）
  - レストラン京都（飲食店）
  - 有機野菜配送センター（流通業者）

#### ✅ タスク管理（Dashboard > Tasks）
- **4つのタスク**
  - トマト畑の肥料散布（完了）
  - きゅうりの収穫（進行中）
  - 大阪市場への出荷準備（保留中）
  - 販売レポートの作成（保留中）

#### 💬 メッセージ（Dashboard > Messages）
- **3つのメッセージスレッド**
  - 大阪青果市場とのやり取り
  - スーパー野菜館との問い合わせ
  - 未読メッセージがある

#### 📄 提案書（Dashboard > Proposals）
- **2つの提案書**
  - 3月度 トマト・ナス供給提案（承認済み）
  - 2月度 季節野菜詰め合わせ（保留中）

#### 🧾 請求書（Dashboard > Invoices）
- **2つの請求書**
  - INV-2026-001（支払い済み）
  - INV-2026-002（未支払い）

---

## 機能を試す

### 1. 栽培記録の詳細を確認
```
Dashboard > Cultivation Records > [記録をクリック]
- 栽培パラメータの確認
- 想定収量・売上の確認
- ステータスの更新
```

### 2. メッセージングを試す
```
Dashboard > Messages > [取引先をクリック]
- 取引先とのメッセージ送受信
- 未読メッセージの確認
```

### 3. タスクを管理
```
Dashboard > Tasks
- ステータスを「In Progress」に変更
- 優先度を設定
- 完了日を記録
```

### 4. 提案書を作成
```
Dashboard > Proposals
- 既存の提案書内容を確認
- 新しい提案書の作成を試す
```

### 5. 請求書を確認
```
Dashboard > Invoices
- 支払い済み・未支払いの請求書を確認
- PDFダウンロードを試す
```

---

## よくある質問

### Q: デモデータをリセットしたい場合は？

以下の方法でリセットできます：

**方法 1: Supabase ダッシュボードから削除**
1. Supabase ダッシュボード > SQL Editor
2. 以下のクエリを実行：
   ```sql
   -- 警告: このクエリはすべてのデータを削除します
   DELETE FROM invoices;
   DELETE FROM proposals;
   DELETE FROM messages;
   DELETE FROM tasks;
   DELETE FROM buyers;
   DELETE FROM cultivation_records;
   DELETE FROM organizations WHERE name = 'デモファーム Aグループ';
   ```

**方法 2: 新しいテストユーザーで再度実行**
1. 新しいテストユーザーを作成
2. `npm run seed:demo` を実行

### Q: デモデータをカスタマイズしたい場合は？

`scripts/seed-demo-data.ts` ファイルを編集してください：

```typescript
// 栽培記録の追加
const cultivationRecords = [
  {
    crop_id: 'tomato',
    field_name: '畑 A',
    area_m2: 500,
    // ... 他のプロパティ
  },
  // さらに追加...
]
```

編集後、再度 `npm run seed:demo` を実行してください。

### Q: 本番環境にデモデータを入れたくない場合は？

デモデータスクリプトは開発環境専用です。本番環境では以下を設定してください：

```bash
# 本番環境
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_prod_xxxxx
```

この場合、スクリプトを実行しないでください。

### Q: スクリプト実行時にエラーが出る場合は？

**Error: Environment variables not found**
```bash
# 確認: .env.local が存在しているか
cat apps/web/.env.local

# 修正: 必要な環境変数を追加
```

**Error: Database connection failed**
```bash
# 確認: Supabase URL とキーが正しいか
# 確認: ネットワーク接続を確認
```

**Error: Permission denied (RLS policy)**
- Supabase の RLS ポリシーを確認してください
- テストユーザーが正しく認証されているか確認

---

## 次のステップ

### デモデータを確認した後：

1. **各機能を実装する**
   - 栽培予測機能
   - 収益シミュレーション
   - 市場価格分析

2. **本番環境へのデプロイ**
   - [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) を参照

3. **本物のデータを入力**
   - 実際の農場データ
   - 取引先情報
   - 過去の販売実績

---

## 🆘 サポート

問題が発生した場合：

1. [NEXT_STEPS.md](./NEXT_STEPS.md) を確認
2. [TESTING_GUIDE.md](./TESTING_GUIDE.md) のトラブルシューティング
3. Supabase ダッシュボードのログを確認
4. ブラウザのコンソール（F12）でエラーメッセージを確認

---

**最終更新**: 2026年3月2日
**バージョン**: 0.1.0
