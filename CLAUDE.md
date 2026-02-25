# APE (Agricultural Price Engine) — Claude Code完全ガイド

> **最終更新**: 2026-02-23
> **バージョン**: v2.0 (everything-claude-code approach)
> **このドキュメント**: Claude Code での開発に必要なすべての情報を含む Single Source of Truth

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [全体アーキテクチャ](#全体アーキテクチャ)
3. [フォルダ構成と依存関係](#フォルダ構成と依存関係)
4. [データフロー](#データフロー)
5. [現在の実装状況](#現在の実装状況)
6. [タスク別ワークフロー](#タスク別ワークフロー)
7. [共通パターン](#共通パターン)
8. [設計書（Single Source of Truth）](#設計書)
9. [テスト・パフォーマンス・セキュリティ](#テスト戦略)
10. [トラブルシューティング](#トラブルシューティング)
11. [開発コマンド](#開発コマンド)

---

## プロジェクト概要

### 何か？

**APE** = 農家向けの経営支援Webアプリケーション。
「作ってから売る」→「売り先を見つけてから作る」マーケットイン思考で農業経営を支援。

### ターゲット

- **農家**: 個人農家、新規就農者、小〜中規模農家
- **普及員・行政**: 将来的に対応予定
- **初期エリア**: 飛騨地域（全国対応前提で設計）
- **言語**: 日本語UI

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| **フロントエンド** | Next.js 15 (App Router, Turbopack) |
| **言語** | TypeScript 5.7 |
| **スタイリング** | TailwindCSS 3 |
| **UI コンポーネント** | Lucide React, 自作 |
| **バックエンド** | Node.js (next/api) |
| **DB** | Supabase (PostgreSQL) |
| **DB操作** | Supabase Client SDK |
| **認証** | Supabase Auth (Google) |
| **リアルタイム** | Supabase Realtime (WebSocket) |
| **RLS** | PostgreSQL Row Level Security |
| **Package Manager** | pnpm 9 |
| **Monorepo** | Turborepo |

---

## 全体アーキテクチャ

### マクロ図

```
┌─────────────────────────────────────────────────────────────┐
│                      ブラウザ (localhost:3000)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Next.js App Router (apps/web/src/app)              │  │
│  │  ├─ /login          ... Supabase Auth               │  │
│  │  ├─ /dashboard      ... 5タブメインUI              │  │
│  │  │  ├─ /           ... ホーム                     │  │
│  │  │  ├─ /calendar    ... カレンダー               │  │
│  │  │  ├─ /crops       ... 栽培                     │  │
│  │  │  ├─ /partners    ... 取引                     │  │
│  │  │  └─ /analytics   ... 経営                     │  │
│  │  └─ /api/*          ... API Routes (Server)      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Components (apps/web/src/components)        │  │
│  │  ├─ layout/ (Sidebar, Header)                      │  │
│  │  ├─ ui/     (Button, Input, Modal, etc.)          │  │
│  │  └─ shared/ (業務ロジック用)                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ↓ HTTP/WebSocket ↓
┌─────────────────────────────────────────────────────────────┐
│              Supabase (Postgres + Auth + Realtime)         │
├─────────────────────────────────────────────────────────────┤
│  スキーマ (supabase/migrations/*)                          │
│  ├─ 00001_initial_schema.sql  ← 全テーブル定義           │
│  ├─ 00002_row_level_security.sql ← 全RLS設定           │
│  └─ 00003_seed_master_data.sql ← マスタデータ           │
├─────────────────────────────────────────────────────────────┤
│  テーブル (ユーザーデータ)                                  │
│  ├─ organizations  ... テナント                           │
│  ├─ users          ... ユーザー                           │
│  ├─ fields         ... 圃場                              │
│  ├─ crops          ... 品目                              │
│  ├─ markets        ... 市場                              │
│  ├─ market_prices  ... 市場価格                          │
│  ├─ messages       ... メッセージ                        │
│  └─ (その他20+テーブル)                                  │
├─────────────────────────────────────────────────────────────┤
│  マスタテーブル (読み取り専用)                              │
│  ├─ crops_master   ... 作物マスタ (NPK, 栽培期間)       │
│  ├─ pesticides_master ... 農薬マスタ                    │
│  ├─ fertilizers_master ... 肥料マスタ                  │
│  └─ markets_master ... 市場マスタ                       │
└─────────────────────────────────────────────────────────────┘
```

### データアクセス層

```
Browser (Client Component)
         ↓
    Client SDK (Supabase JS)
         ↓
    Supabase Auth + Row Level Security
         ↓
    PostgreSQL
```

```
Browser (Server Component) / API Route
         ↓
    Server SDK (Supabase.createClient with cookies)
         ↓
    Supabase Auth (from cookies) + RLS
         ↓
    PostgreSQL
```

---

## フォルダ構成と依存関係

### 詳細ツリー

```
APE/                                    # Turborepo monorepo root
├── CLAUDE.md                           # ← このファイル（必読）
├── PLAN.md                             # 旧モバイル計画（参照用）
├── pnpm-workspace.yaml                 # monorepo定義
├── turbo.json                          # Turbo設定
│
├── apps/
│   └── web/                            # 🔥 メインWebアプリ
│       ├── package.json
│       ├── next.config.js
│       ├── tsconfig.json               # strict mode
│       ├── tailwind.config.ts           # TailwindCSS設定
│       ├── src/
│       │   ├── app/                    # Next.js App Router
│       │   │   ├── layout.tsx          # ルートレイアウト (Sidebar, Header)
│       │   │   ├── page.tsx            # ランディングページ (/）
│       │   │   │
│       │   │   ├── login/
│       │   │   │   └── page.tsx        # ログイン画面
│       │   │   │
│       │   │   ├── auth/
│       │   │   │   └── callback/       # OAuth callback
│       │   │   │
│       │   │   ├── onboarding/         # 初期セットアップフロー
│       │   │   │   ├── page.tsx
│       │   │   │   ├── crops/page.tsx
│       │   │   │   └── ...
│       │   │   │
│       │   │   ├── dashboard/          # ダッシュボード（メイン）
│       │   │   │   ├── layout.tsx      # ダッシュボード共通レイアウト
│       │   │   │   ├── page.tsx        # ホーム（旧設計 + 新設計）
│       │   │   │   │
│       │   │   │   ├── calendar/       # 📅 カレンダー（統合）
│       │   │   │   │   ├── page.tsx    # カレンダー + 農場マップ + タスク
│       │   │   │   │   └── ...
│       │   │   │   │
│       │   │   │   ├── records/        # 栽培記録（カレンダーに統合予定）
│       │   │   │   │   ├── page.tsx    # 旧: 栽培記録UI
│       │   │   │   │   └── materials/
│       │   │   │   │       └── page.tsx # 資材管理（農薬・肥料DB）
│       │   │   │   │
│       │   │   │   ├── tasks/          # タスク管理（カレンダーに統合予定）
│       │   │   │   │   └── page.tsx
│       │   │   │   │
│       │   │   │   ├── land-match/     # 土地診断（栽培タブに統合予定）
│       │   │   │   │   └── page.tsx
│       │   │   │   │
│       │   │   │   ├── simulator/      # 収益シミュレーター（栽培タブ）
│       │   │   │   │   └── page.tsx
│       │   │   │   │
│       │   │   │   ├── market/         # 市場価格（ホームに統合予定）
│       │   │   │   │   └── page.tsx
│       │   │   │   │
│       │   │   │   ├── listings/       # 取引先管理（取引タブ）
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── new/page.tsx
│       │   │   │   │   └── [id]/page.tsx
│       │   │   │   │
│       │   │   │   ├── map/            # マップ（取引タブ）
│       │   │   │   │   └── page.tsx
│       │   │   │   │
│       │   │   │   ├── proposals/      # 提案書（取引タブ）
│       │   │   │   │   └── page.tsx
│       │   │   │   │
│       │   │   │   ├── invoices/       # 請求・納品（取引タブ）
│       │   │   │   │   └── page.tsx
│       │   │   │   │
│       │   │   │   ├── chat/           # メッセージ（取引タブ）
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── [buyerId]/page.tsx
│       │   │   │   │
│       │   │   │   ├── analytics/      # 経営分析（経営タブ）
│       │   │   │   │   └── page.tsx
│       │   │   │   │
│       │   │   │   └── settings/       # 設定（経営タブ）
│       │   │   │       └── page.tsx
│       │   │   │
│       │   │   └── api/
│       │   │       └── ... (API Routes)
│       │   │
│       │   ├── components/             # React コンポーネント
│       │   │   ├── layout/
│       │   │   │   ├── Sidebar.tsx     # 左サイドバー
│       │   │   │   ├── SidebarCustomizeModal.tsx  # サイドバーカスタマイズ
│       │   │   │   ├── DashboardHeader.tsx
│       │   │   │   └── ...
│       │   │   │
│       │   │   ├── ui/
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Input.tsx
│       │   │   │   ├── Modal.tsx
│       │   │   │   ├── Card.tsx
│       │   │   │   └── ... (基本UI部品)
│       │   │   │
│       │   │   └── shared/
│       │   │       ├── CropSelector.tsx
│       │   │       ├── DatePicker.tsx
│       │   │       └── ... (業務部品)
│       │   │
│       │   ├── hooks/
│       │   │   ├── useSidebarConfig.ts # ← サイドバーON/OFF管理
│       │   │   ├── useAuth.ts
│       │   │   └── ... (カスタムフック)
│       │   │
│       │   ├── lib/
│       │   │   ├── cn.ts               # classname utility
│       │   │   ├── supabase/
│       │   │   │   ├── client.ts       # ブラウザ用Supabase
│       │   │   │   ├── server.ts       # サーバー用Supabase
│       │   │   │   └── queries.ts      # SQL queries (ビジネスロジック)
│       │   │   └── ... (その他utilities)
│       │   │
│       │   └── styles/
│       │       ├── globals.css         # グローバルスタイル
│       │       └── variables.css       # CSS variables (色etc)
│       │
│       └── .next/                      # Next.js ビルド出力（git ignore）
│
├── packages/
│   ├── shared/                         # 共有型定義
│   │   └── src/
│   │       └── types.ts                # 型定義（shared用）
│   │
│   └── db/                             # DB関連パッケージ
│       └── src/
│           ├── types.ts                # Supabase 自動生成型
│           └── ... (DB utilities)
│
├── supabase/                           # Supabase設定 + マイグレーション
│   ├── config.toml                     # Supabase local dev設定
│   ├── migrations/
│   │   ├── 00001_initial_schema.sql    # テーブル定義
│   │   ├── 00002_row_level_security.sql # RLS設定
│   │   └── 00003_seed_master_data.sql  # マスタデータ
│   └── functions/
│       └── ... (Edge Functions)
│
├── documents/                          # 📚 設計書・ドキュメント
│   ├── APE_Product_Blueprint.md        # ✨ メイン設計書（必読）
│   ├── 00_事業計画資料_Docs/
│   │   ├── Business_Plan.md
│   │   ├── APE_concept_v3.md
│   │   └── APE_concept_v2_extracts.md
│   ├── 01_計算ロジック_Logic/
│   │   ├── APE_Mathematical_Model.md
│   │   └── profit_simulation_logic_v1.md
│   ├── 02_参考文献データ_References/
│   │   └── bibliography_unified.md
│   ├── 05_ユーザーインタビュー_Interviews/
│   │   ├── 2026-02-19_小林俊平_市橋賢治_戦略会議.md
│   │   └── 2026-02-20_小森萌_意見交換会.md
│   └── 99_AIプロンプト_Prompts/
│       └── ... (参考用プロンプト)
│
├── client_projects/                    # 実顧客データ（git ignore）
├── demo/                               # Streamlit デモ（旧）
└── utilities/                          # PDF生成スクリプト等
```

### 依存関係マップ

```
【ページレベルの依存関係】

/dashboard/page (ホーム)
  ├─→ packages/db/types.ts (Organization, User型)
  ├─→ lib/supabase/queries.ts (getCrops, getLatestMarketPrices など)
  └─→ components/ui/* (Card, Button など)

/dashboard/calendar (カレンダー)
  ├─→ hooks/useSidebarConfig.ts (カレンダーもフィルタリング対象)
  ├─→ lib/supabase/queries.ts (イベントデータ取得)
  └─→ components/ui/* + shared/*

/dashboard/invoices (請求・納品)
  ├─→ lib/supabase/queries.ts (請求データ取得)
  └─→ components/* (発行UI)

...etc

【コンポーネントレベルの依存関係】

Sidebar.tsx (← 最重要)
  ├─→ hooks/useSidebarConfig.ts (ON/OFF状態管理)
  ├─→ components/layout/SidebarCustomizeModal.tsx
  ├─→ lib/supabase/client.ts (ログアウト処理)
  └─→ lib/cn.ts (스타일)

pages/dashboard/layout.tsx
  ├─→ Sidebar.tsx
  ├─→ DashboardHeader.tsx
  └─→ hooks/useAuth.ts (ユーザー認証)

【データフロー】

DB Changes (Supabase)
  ↓
Realtime Subscription (chat など)
  ↓
Client State Updates
  ↓
UI Re-render
```

---

## データフロー

### 認証フロー

```
1. ユーザーが /login にアクセス
   ↓
2. 「Google でログイン」をクリック
   ↓
3. Supabase Auth に redirect
   ↓
4. Google OAuth ダイアログ
   ↓
5. Google が認証完了
   ↓
6. Supabase が /auth/callback?code=xxx にリダイレクト
   ↓
7. callback ページが code を Supabase に送信
   ↓
8. Supabase が session cookie を設定
   ↓
9. /dashboard に redirect
   ↓
10. Sidebar が session から userInfo を取得して表示
```

### データ読み書きフロー

#### 【サーバーコンポーネント】

```
Server Component (page.tsx)
  ├─→ lib/supabase/server.ts (createClient)
  ├─→ 直接 DB に SQL を実行
  ├─→ RLS が自動的にチェック (user_id, organization_id)
  ├─→ データを取得して JSX に埋め込み
  ↓
HTML レンダリング → ブラウザに送信
```

#### 【クライアントコンポーネント】

```
Client Component (useEffect, onClick など)
  ├─→ lib/supabase/client.ts (createClient)
  ├─→ from('table').select().eq('id', x)
  ├─→ RLS が自動的にチェック (user_id, organization_id)
  ├─→ setState で UI 更新
  ↓
React Render
```

#### 【API Route】

```
Browser -> POST /api/create-invoice
  ↓
/api/create-invoice.ts (Next.js API Route)
  ├─→ request body をパース
  ├─→ lib/supabase/server.ts で DB 操作
  ├─→ RLS チェック
  ├─→ DB に insert
  ↓
{ success: true, id: '...' } を return
  ↓
Browser で response を処理
```

### リアルタイムデータフロー (例: チャット)

```
【送信側】
User A types message
  ↓
onClick="handleSend()"
  ↓
supabase.from('messages').insert({ ... })
  ↓
DB に insert
  ↓
RLS OK → insert 成功

【受信側】
useEffect(() => {
  supabase
    .channel('buyerId')
    .on('postgres_changes', { event: 'INSERT', ... }, (payload) => {
      setMessages(prev => [...prev, payload.new])
    })
    .subscribe()
}, [])
  ↓
DB に新しい行が insert された
  ↓
Realtime webhook が WebSocket を通じてクライアントに通知
  ↓
callback が実行され setMessages
  ↓
React が UI を再レンダリング
```

---

## 現在の実装状況

### ✅ 完了

- **基盤**: Next.js + Supabase + Turborepo 構築完了
- **認証**: Google OAuth + session cookie 実装済み
- **DB**: 初期スキーマ + RLS + マスタデータ完成
- **UI**: 18ページのダッシュボードUI（旧設計で実装）
- **サイドバー**: 機能ON/OFFカスタマイズ機能 + modal実装済み
- **ランディングページ**: 実装済み

### 🔄 進行中 / 優先度HIGH

| タスク | 優先度 | 概要 |
|--------|--------|------|
| サイドバー5タブへの統合 | **P0** | 13項目を5つに整理。既存ページをリファクタ |
| カレンダーの統合 | **P0** | 栽培記録 + タスク管理を calendar に統合 |
| 農場マップ機能 | **P1** | カレンダー内に圃場マップ・作業進捗表示 |
| 市場データ統合 | **P1** | market ページをホームに統合。外部API連携 |
| 提案書自動生成 | **P2** | 栽培履歴から自動で提案資料を作成 |
| 音声・写真入力 | **P2** | アンケート形式フォームに追加 |

### ❌ 未実装

- 完全なリファクタリング（5タブ統合）
- 外部API連携（気象、市場価格など）
- 提案書・請求書の自動生成ロジック
- モバイルアプリ（apps/mobile は未着手）
- 普及員向け機能
- 行政向けレポート機能

---

## タスク別ワークフロー

### 🎯 新しいページを作る

```
1. documents/APE_Product_Blueprint.md で要件確認
   └─ どの5タブに属するか？
   └─ ユーザーがON/OFFできるか？

2. 新しいpage.tsxを作成
   例) apps/web/src/app/dashboard/{tabname}/{feature}/page.tsx

3. Server or Client どちらか判断
   - データ読み込みだけ → Server Component ✓
   - インタラクション多い → Client Component

4. DB query が必要なら
   └─ lib/supabase/queries.ts に新規関数を追加
   └─ packages/db/types.ts で型を確認

5. UI コンポーネントを実装
   └─ components/ui/* から基本部品を使う
   └─ components/shared/* で業務ロジックをラップ

6. Sidebar に新しいタブを追加（必要に応じて）
   └─ components/layout/Sidebar.tsx
   └─ SidebarCustomizeModal.tsx でON/OFF対象に追加

7. テストコマンドで確認
   $ pnpm build
   $ pnpm --filter web dev
   ✓ localhost:3000 でアクセス可能か確認
```

### 🔧 既存ページを修正する

```
1. エラーが出ている page.tsx を開く
   例) apps/web/src/app/dashboard/invoices/page.tsx

2. エラーメッセージから以下をチェック
   □ TypeScript エラー → types.ts で型確認
   □ API エラー → lib/supabase/queries.ts で関数確認
   □ UI エラー → components/* で import 確認
   □ Build エラー → pnpm build で再確認

3. 関連ファイルを修正
   - page.tsx の修正で済むか
   - queries.ts の修正が必要か
   - コンポーネントの修正が必要か

4. 再度 pnpm build でチェック

5. ローカルで動作確認
   $ pnpm --filter web dev
```

### 📊 新しいフィールドをDBに追加する

```
⚠️ 重要: migrations は作る。直接 Supabase web でいじらない！

1. supabase/migrations/00004_add_new_field.sql を作成

2. SQL を書く
   ```sql
   ALTER TABLE users ADD COLUMN new_field TEXT;
   ```

3. Supabase local dev で適用
   $ supabase migration up

4. packages/db/types.ts を再生成
   $ supabase gen types typescript > packages/db/src/types.ts

5. 必要なら lib/supabase/queries.ts に新規 query 関数を追加

6. page.tsx で使用開始
```

### 💬 API Route を作る

```
1. 新しい API Route ファイルを作成
   apps/web/src/app/api/send-proposal.ts

2. テンプレート
   ```typescript
   import { createClient } from '@/lib/supabase/server'
   import { NextRequest, NextResponse } from 'next/server'

   export async function POST(req: NextRequest) {
     const supabase = createClient()
     const { proposalId } = await req.json()

     // 認証チェック
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

     // ビジネスロジック
     const { error } = await supabase
       .from('proposals')
       .update({ status: 'sent' })
       .eq('id', proposalId)

     if (error) return NextResponse.json({ error: error.message }, { status: 500 })

     return NextResponse.json({ success: true })
   }
   ```

3. Client Component から呼び出し
   ```typescript
   const response = await fetch('/api/send-proposal', {
     method: 'POST',
     body: JSON.stringify({ proposalId: '123' })
   })
   ```

4. エラーハンドリング (try-catch 必須)
```

### 🎨 新しいUIコンポーネントを作る

```
1. 基本部品レベル (button, input など)
   └─ components/ui/{component-name}.tsx
   └─ TailwindCSS で完全にスタイリング

2. 業務ロジック含む (crop selector など)
   └─ components/shared/{component-name}.tsx
   └─ hooks や lib を import して使用

3. TypeScript props interface を定義
   ```typescript
   interface CropSelectorProps {
     value: string
     onChange: (value: string) => void
     disabled?: boolean
   }
   ```

4. Storybook はなし。README.md に使用例を書く
```

---

## 共通パターン

### パターン1: フォームの入力と保存

```typescript
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function CropForm() {
  const [formData, setFormData] = useState({ name: '', area: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: dbError } = await supabase
        .from('crops')
        .insert([formData])

      if (dbError) throw dbError

      // 成功処理
      setFormData({ name: '', area: 0 })
      alert('保存しました')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラー')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button disabled={loading}>{loading ? '保存中...' : '保存'}</button>
    </form>
  )
}
```

### パターン2: サーバーコンポーネントでデータ取得

```typescript
import { getCrops } from '@/lib/supabase/queries'

export default async function CropList() {
  const crops = await getCrops()

  return (
    <div>
      {crops.map((crop) => (
        <div key={crop.id}>{crop.name}</div>
      ))}
    </div>
  )
}
```

### パターン3: リアルタイムメッセージ

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ChatRoom({ buyerId }: { buyerId: string }) {
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    // 初期データ読み込み
    supabase
      .from('messages')
      .select('*')
      .eq('buyer_id', buyerId)
      .then(({ data }) => setMessages(data || []))

    // リアルタイム購読
    const subscription = supabase
      .channel(`buyer:${buyerId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `buyer_id=eq.${buyerId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [buyerId])

  return <div>{messages.map((msg) => <p key={msg.id}>{msg.content}</p>)}</div>
}
```

### パターン4: エラーハンドリング

```typescript
// ❌ 悪い例
const data = await supabase.from('users').select('*')
console.log(data) // エラーを見落とす可能性

// ✅ 良い例
const { data, error } = await supabase.from('users').select('*')

if (error) {
  console.error('DB error:', error.message)
  throw new Error(`ユーザー読み込みエラー: ${error.message}`)
}

if (!data) {
  throw new Error('データが見つかりません')
}

return data
```

### パターン5: 条件付きフィルタリング

```typescript
let query = supabase
  .from('crops')
  .select('*')
  .eq('organization_id', orgId)

// 条件付きで追加フィルタ
if (filters.category) {
  query = query.eq('category', filters.category)
}

if (filters.minArea) {
  query = query.gte('area', filters.minArea)
}

const { data, error } = await query

return data || []
```

---

## 設計書

### 📖 読むべき順序

1. **このファイル** (`CLAUDE.md`)
   → 開発の全体像とワークフロー

2. **`documents/APE_Product_Blueprint.md`**
   → 5タブ構成と全機能の詳細設計
   → **機能追加・修正の前に必ず読むこと**

3. **`documents/05_ユーザーインタビュー_Interviews/*.md`**
   → ユーザーの実際のニーズ・フィードバック
   → UI設計時に参照

4. **`documents/00_事業計画資料_Docs/*.md`**
   → ビジネスプラン、価格戦略
   → プロダクト戦略の背景理解

### 設計書で定義されている5タブ

#### 🏠 ホーム
- 1-1. 今日のサマリー (天気、タスク、通知)
- 1-2. 自分の品目の市場動向 (価格推移、生産量)
- 1-3. 他産地情報・全国動向 (競合産地、出荷量予測)
- 1-4. おすすめ情報 (新資材、狙い目品目)

#### 📅 カレンダー
- 2-1. カレンダービュー (月間/週間/日別)
- 2-2. 農場マップ (圃場の進捗、作業動線)
- 2-3. 栽培記録 (アンケート形式、写真、音声)
- 2-4. 積算温度トラッカー (収穫予定日予測)

#### 🌱 栽培
- 3-1. 土地情報・気象データ (3年分、未来予測)
- 3-2. 土壌分析 (改善施策、施肥計画)
- 3-3. 収益シミュレーター (品目別利益、キャッシュフロー)
- 3-4. 資材管理 (農薬DB、肥料DB、在庫)

#### 🤝 取引
- 4-1. 取引先管理 (リスト、マップ、信用調査)
- 4-2. 販路提案・自動提案書生成
- 4-3. 請求・納品管理
- 4-4. メッセージ (取引先チャット)

#### 📊 経営
- 5-1. 売上・経費分析 (KPI、前年比)
- 5-2. コスト分析 (作付けごとのコスト)
- 5-3. レポート出力 (PDF、行政向け)

---

## テスト戦略

### テストの種類

| 種類 | ツール | 対象 | 実行タイミング |
|------|--------|------|--------------|
| **ユニットテスト** | Jest | utilities, hooks | 機能完成時 |
| **統合テスト** | Jest + Supabase emulator | queries, API routes | 機能完成時 |
| **E2E テスト** | Playwright | ページ遷移、フォーム | リリース前 |
| **ビジュアルテスト** | Manual | レイアウト、色 | 毎回 |
| **型チェック** | TypeScript tsc | 全コード | ビルド前 |

### テスト実行

```bash
# 全テスト実行
pnpm test

# ユニットテストのみ
pnpm test:unit

# E2E テスト
pnpm test:e2e

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

### テスト例

```typescript
// __tests__/lib/supabase/queries.test.ts
import { getCrops } from '@/lib/supabase/queries'

jest.mock('@/lib/supabase/server')

describe('getCrops', () => {
  it('should return crops for organization', async () => {
    // ... setup
    const crops = await getCrops()
    expect(crops).toHaveLength(2)
    expect(crops[0].name).toBe('トマト')
  })
})
```

---

## パフォーマンス・セキュリティ

### パフォーマンス

#### 🟢 いいこと

- Server Components でデータ取得 → Client に送るデータを最小化
- Next.js Image 使用
- TailwindCSS (tree shaking で CSS 最小化)
- Turbopack で dev 起動高速化
- リアルタイム購読は必要な channel だけ

#### 🔴 避けるべき

```typescript
// ❌ 悪い: 無限ループ
useEffect(() => {
  const data = supabase.from('crops').select('*')
  // dependency array がない
})

// ✓ 良い
useEffect(() => {
  const data = supabase.from('crops').select('*')
}, []) // 初回だけ実行

// ❌ 悪い: 全データ取得
const { data } = await supabase.from('users').select('*') // 10,000 rows!

// ✓ 良い
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('organization_id', orgId)
  .limit(100)
```

### セキュリティ

#### ✅ 必須チェック

- [ ] RLS が有効か？ (supabase/migrations/00002_row_level_security.sql)
- [ ] API key を `.env.local` に `.gitignore` で除外？
- [ ] SQL injection 対策？ (Supabase SDK が自動でパラメータ化)
- [ ] XSS 対策？ (React が自動でエスケープ)
- [ ] CSRF 対策？ (Supabase cookie 自動ハンドル)
- [ ] 認証チェック？ (API Route で `getUser()`)
- [ ] 権限チェック？ (RLS で自動)

#### 🚨 警告

```typescript
// ❌ 危険: クライアントからシークレットキー使用
const supabase = createClient('URL', 'SECRET_KEY') // 漏洩！

// ✓ 安全: anon key を使用（RLS で保護）
const supabase = createClient('URL', 'ANON_KEY')

// ❌ 危険: ユーザー入力を直接 SQL に挿入
const { data } = await supabase.from('crops').select(`*, records!inner(*)`)

// ✓ 安全: パラメータを使用
const { data } = await supabase
  .from('crops')
  .select('*')
  .eq('name', userInput) // SDK がパラメータ化
```

---

## トラブルシューティング

### よくある問題と解決方法

#### 🔴 Build が失敗する

```bash
# エラーメッセージを確認
pnpm build

# 多くの場合、以下の3つのどれか:
# 1. TypeScript エラー
#    → 対象ファイルを開いて型をチェック
#    → packages/db/types.ts で型定義を確認

# 2. Import エラー
#    → import パスを確認
#    → ファイルが存在するか確認

# 3. 依存関係エラー
#    → pnpm install を再実行
#    → pnpm store prune で cache をクリア
```

#### 🔴 localhost:3000 に接続できない

```bash
# サーバーが起動しているか確認
ps aux | grep "next dev"

# 起動していなければ
pnpm --filter web dev

# ポート 3000 が占有されている場合
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows
# PID を確認して kill
```

#### 🔴 DB クエリが 401 Unauthorized を返す

```
原因: RLS で organization_id か user_id がマッチしていない

対策:
1. select クエリを確認
   → .eq('organization_id', userOrgId) が入っているか？

2. RLS policy を確認
   → supabase/migrations/00002_row_level_security.sql を見る

3. ユーザーがテーブルに対する権限を持つか
   → Supabase dashboard で確認
```

#### 🔴 リアルタイム購読が動かない

```typescript
// 原因: channel 名が一致していない、または unsubscribe タイミング

// ✓ 正しい例
useEffect(() => {
  const sub = supabase
    .channel('user-updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
      setUsers(prev => [...prev, payload.new])
    })
    .subscribe()

  return () => {
    sub.unsubscribe()  // cleanup 必須！
  }
}, [])
```

#### 🔴 Tailwind CSS が適用されていない

```typescript
// 原因: class name を動的に生成している可能性

// ❌ Tailwind が認識できない（purge されてしまう）
const bgColor = state ? 'bg-green-500' : 'bg-red-500'
<div className={bgColor}>

// ✓ 解決: lib/cn.ts を使う
import { cn } from '@/lib/cn'
const bgColor = state ? 'bg-green-500' : 'bg-red-500'
<div className={cn('p-4', bgColor)}>

// または
<div className={cn('p-4', state && 'bg-green-500', !state && 'bg-red-500')}>
```

#### 🔴 Supabase local dev が起動しない

```bash
# Supabase CLI をインストール
brew install supabase/tap/supabase

# local dev 起動
supabase start

# その他のトラブル
supabase status
supabase stop
supabase reset  # ⚠️ データ削除される
```

---

## 開発コマンド

### セットアップ

```bash
# リポジトリを clone
git clone https://github.com/yourorg/APE.git
cd APE

# 依存関係をインストール
pnpm install

# Supabase local dev 起動（DB操作が必要な場合）
supabase start

# .env.local を設定（Supabase keys をコピー）
# （ファイルの見本は .env.example を参照）
```

### 開発

```bash
# Web アプリを localhost:3000 で起動
pnpm --filter web dev

# または short hand
pnpm dev:web

# 全パッケージの型チェック
pnpm typecheck

# Lint チェック
pnpm lint

# 全パッケージをビルド（本番向け）
pnpm build

# テスト実行
pnpm test
```

### デバッグ

```bash
# localhost:3000 にアクセス（開発中）
# DevTools を開く (F12)
# → Console, Network, Application タブで確認

# DB を Supabase dashboard で確認
http://localhost:54323

# サーバーサイドログを確認
# → ターミナルの pnpm dev:web 出力を見る
```

### リリース

```bash
# 本番環境へのビルド
pnpm build

# ビルト出力を確認
ls apps/web/.next

# Vercel への自動デプロイ
# (git push で自動的に CI/CD パイプラインが実行)
```

---

## コーディング規約（再掲）

### TypeScript

```typescript
// ✓ 必須: strict mode で型チェック厳密
// tsconfig.json: "strict": true

// ✓ 推奨: 明示的な型指定
const users: User[] = await getCrops()

// ❌ 避ける: any を使う
const data: any = { ... } // 型安全性を失う
```

### React

```typescript
// ✓ Server Component (データ取得)
export default async function CropList() {
  const crops = await getCrops()
  return <div>{crops.map(...)}</div>
}

// ✓ Client Component (interactivity)
'use client'
export default function FormComponent() {
  const [state, setState] = useState()
  return <input onChange={(e) => setState(e.target.value)} />
}
```

### スタイリング

```typescript
// ✓ TailwindCSS のみ
<div className="p-4 bg-white rounded-lg shadow">

// ❌ inline style は禁止
<div style={{ padding: '16px' }}>
```

### ファイル名

```
// ✓ kebab-case
crop-selector.tsx
field-map.tsx

// ❌ PascalCase（コンポーネント internal は PascalCase OK）
CropSelector.tsx  // 間違い（ファイル名）

// ✓ コンポーネント名は PascalCase
export function CropSelector() { }
```

### 日本語コメント

```typescript
// ✓ 技術的な詳細は日本語で OK
// ユーザーの organization_id で filter
const crops = await getCrops(orgId)

// ❌ 当たり前のことをコメントしない
const x = 1  // x を 1 に設定
```

---

## 必ず読むドキュメント

| ファイル | 読むべき人 | タイミング |
|---------|----------|---------|
| `CLAUDE.md` (このファイル) | 全員 | **初回開発前（必須）** |
| `documents/APE_Product_Blueprint.md` | 全員 | **機能追加・修正前** |
| `documents/05_ユーザーインタビュー_Interviews/*.md` | デザイナー、PM | **UI設計時** |
| `supabase/migrations/*.sql` | Backend 担当 | **DB修正時** |
| `packages/db/types.ts` | 全員 | **型がわからない時** |

---

## 今後のロードマップ

### Phase 1: サイドバー統合 (P0)
- [ ] 5タブへのリファクタリング
- [ ] 既存18ページの整理
- [ ] サイドバーON/OFFのテスト

### Phase 2: 農場オペレーション (P1)
- [ ] カレンダーに農場マップ統合
- [ ] 栽培記録 + タスク統合
- [ ] 積算温度トラッカー

### Phase 3: 市場インテリジェンス (P2)
- [ ] 外部API連携（気象、市場価格）
- [ ] 産地別情報の表示
- [ ] おすすめ品目の提案ロジック

### Phase 4: 自動生成機能 (P3)
- [ ] 提案書自動生成
- [ ] 請求書自動生成
- [ ] 栽培履歴レポート生成

---

## おわりに

このドキュメントは **living document** です。

開発を進める中で新しい知見・パターンが見つかったら、このファイルを更新してください。

**何か不明な点があれば、このファイルを参照。それでもわからなければ `documents/APE_Product_Blueprint.md` を参照。**

Happy coding! 🌾
