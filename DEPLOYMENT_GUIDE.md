# 🚀 APE 本番環境デプロイガイド

**ステータス**: 本番環境へのデプロイ準備完了
**日付**: 2026-02-28

---

## 📋 デプロイ前チェックリスト

```
✅ Supabase統合        完了
✅ E2Eテスト          完全パス (13/13)
✅ セキュリティ監査    完了 (10/10)
✅ パフォーマンス      良好 (757ms)
✅ ドキュメント       完備 (6ファイル)
✅ 環境検証スクリプト  完成
```

---

## 🎯 デプロイ手順

### **1️⃣ Supabase本番マイグレーション実行**

```bash
# ログイン
supabase login

# 本番環境プロジェクトをリンク
supabase link --project-ref [your-project-ref]

# マイグレーション実行
supabase migration push
```

**確認事項:**
- [ ] すべてのマイグレーションが成功したか
- [ ] RLSポリシーが適用されたか
- [ ] マスターデータがシードされたか

---

### **2️⃣ 本番環境変数を設定**

**Verselの場合:**

1. Vercelダッシュボードを開く
2. `Settings → Environment Variables` へ移動
3. 以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_[your-key]
```

**その他のプラットフォーム:**
同様に環境変数を設定してください。

---

### **3️⃣ 本番ビルド実行**

```bash
# ローカルで本番ビルドをテスト
pnpm build

# サイズ確認
du -sh apps/web/.next
```

**期待される結果:**
- ✅ ビルド成功
- ✅ no errors
- ✅ サイズ: < 200MB

---

### **4️⃣ デプロイ実行**

#### **Vercelの場合:**

```bash
# Vercelをインストール（未インストール時）
npm install -g vercel

# デプロイ
vercel deploy --prod
```

#### **その他のプラットフォーム:**

- AWS: Amplify / AppRunner
- Google Cloud: App Engine / Cloud Run
- Azure: App Service
- Render: Web Service
- Railway: Deploy

---

### **5️⃣ デプロイ後の確認**

デプロイ完了後、以下を確認:

```bash
# 1. アクセス確認
curl https://[your-domain]/

# 2. ログインページ
curl https://[your-domain]/login

# 3. ダッシュボード (要ログイン)
curl https://[your-domain]/dashboard
```

**確認項目:**
- [ ] Webサイトが利用可能か
- [ ] HTTPSが有効か
- [ ] ログインが機能するか
- [ ] ダッシュボードが表示されるか
- [ ] Supabaseに接続できるか

---

## 🔐 セキュリティチェック（本番前）

```bash
# 1. 秘密キーが含まれていないか確認
node scripts/security-audit.js

# 2. パフォーマンス測定
pnpm validate:all

# 3. ブラウザ開発者ツール確認
# - Console: エラーなし
# - Network: すべてのリクエストが200-299
# - Security: 警告なし
```

---

## 📊 本番環境での確認項目

| チェック項目 | 方法 | 成功条件 |
|------------|------|--------|
| Webサイト可用性 | ブラウザアクセス | 200 OK |
| SSL/TLS | `https://` でアクセス | 🔒アイコン表示 |
| ログイン機能 | Supabaseで新規ユーザー作成 | ダッシュボード表示 |
| データベース接続 | ページの表示 | Supabaseからデータ表示 |
| パフォーマンス | Lighthouse測定 | LCP < 2.5s |
| エラー対応 | 存在しないページアクセス | 404ページ表示 |

---

## 🚨 デプロイ後の監視

### **ログ確認**

```bash
# Verselの場合
vercel logs [project-name]

# その他のプラットフォーム: 各プラットフォームのログ機能を使用
```

### **監視項目**

- ✅ エラーレート < 0.1%
- ✅ 応答時間 < 1秒
- ✅ CPU使用率 < 50%
- ✅ メモリ使用率 < 70%

---

## 📞 トラブルシューティング

### **問題: 500エラー**

```bash
# 1. ログを確認
vercel logs [project-name]

# 2. 環境変数を確認
# NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY が正しいか

# 3. ローカルで再テスト
pnpm dev
```

### **問題: ログインできない**

```bash
# 1. Supabase接続を確認
# Supabaseダッシュボード → Authentication → Users

# 2. 認証設定を確認
# Supabaseダッシュボード → Settings → Authentication
```

### **問題: ページが遅い**

```bash
# 1. パフォーマンス測定
# https://pagespeed.web.dev/ で測定

# 2. キャッシュ設定を確認
# CDN設定を調整
```

---

## ✅ デプロイチェックリスト

デプロイ実行前に以下をすべてチェック:

- [ ] `node scripts/security-audit.js` が成功
- [ ] `pnpm validate:all` が成功
- [ ] `pnpm build` がエラーなし
- [ ] `.env.local` に本番キーが設定されていない
- [ ] `client_projects/` がコミットされていない
- [ ] GitHub プライベートリポジトリ設定確認
- [ ] Supabase本番プロジェクトが準備完了
- [ ] デプロイプラットフォームのアカウントセットアップ完了
- [ ] ドメイン設定完了（必要に応じて）
- [ ] SSL証明書が自動更新されるよう設定完了

---

## 🎉 デプロイ後

1. **ユーザーへの通知**
   - メール送信
   - SNS投稿
   - ドキュメント公開

2. **監視設定**
   - ログ監視
   - エラー監視
   - パフォーマンス監視

3. **フォローアップ**
   - ユーザーフィードバック収集
   - バグ報告対応
   - 改善検討

---

## 📚 参考資料

| ドキュメント | 内容 |
|------------|------|
| PRODUCTION_SETUP.md | 本番セットアップ詳細 |
| COMPLETION_STATUS.md | 完成度レポート |
| IMPLEMENTATION_SUMMARY.md | 実装詳細 |
| SESSION_SUMMARY.md | セッション概要 |

---

## 🚀 デプロイ実行コマンド（簡略版）

```bash
# 1. セキュリティ確認
node scripts/security-audit.js

# 2. ビルド確認
pnpm build

# 3. Supabaseマイグレーション（初回のみ）
supabase login
supabase link --project-ref [your-project-ref]
supabase migration push

# 4. Verselデプロイ
vercel deploy --prod

# 5. 本番環境確認
curl https://[your-domain]/
```

---

**デプロイはこのガイドに従って実行してください。質問がある場合は、各セクションのドキュメントを参照してください。** 🎊
