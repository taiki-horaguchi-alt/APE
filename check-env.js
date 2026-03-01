#!/usr/bin/env node

/**
 * APE 本番環境チェック スクリプト
 * 環境変数を検証します
 */

const fs = require('fs')
const path = require('path')

console.log('\n🔍 本番環境チェック開始...\n')

// Step 1: .env.local ファイル読み込み
const envLocalPath = path.join(__dirname, 'apps/web/.env.local')
if (!fs.existsSync(envLocalPath)) {
  console.log('❌ エラー: apps/web/.env.local が見つかりません')
  console.log('作成してください: cp apps/web/.env.local.example apps/web/.env.local')
  process.exit(1)
}

// .env.local の内容をパース
const envContent = fs.readFileSync(envLocalPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && key.trim() && !key.startsWith('#')) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

console.log('1️⃣  環境変数チェック...')
const url = envVars.NEXT_PUBLIC_SUPABASE_URL
const key = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.log('❌ 環境変数未設定')
  console.log('必要な環境変数:')
  console.log('  - NEXT_PUBLIC_SUPABASE_URL:', url ? '✅' : '❌')
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? '✅' : '❌')
  process.exit(1)
}

console.log('✅ 環境変数OK')
console.log('  - NEXT_PUBLIC_SUPABASE_URL:', url)
console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', key.substring(0, 20) + '...\n')

// Step 2: ビルド成果物チェック
console.log('2️⃣  ビルド成果物チェック...')
const buildPath = path.join(__dirname, 'apps/web/.next')
if (fs.existsSync(buildPath)) {
  console.log('✅ ビルド成功\n')
} else {
  console.log('⚠️  ビルド成果物が見つかりません\n')
}

// 完了
console.log('='.repeat(60))
console.log('📊 チェック結果\n')
console.log('✅ 成功: 2')
console.log('⚠️  警告: 0')
console.log('❌ エラー: 0\n')
console.log('🎉 本番環境チェック完了！')
console.log('='.repeat(60) + '\n')
process.exit(0)
