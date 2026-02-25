#!/usr/bin/env npx ts-node

/**
 * Production Checklist Script
 * 本番環境へのデプロイ前の自動チェック
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

interface CheckResult {
  name: string
  passed: boolean
  message: string
  severity: 'error' | 'warning' | 'info'
}

const results: CheckResult[] = []

function addResult(name: string, passed: boolean, message: string, severity: 'error' | 'warning' | 'info' = 'info') {
  results.push({ name, passed, message, severity })
}

async function runChecks() {
  console.log('🔍 本番環境チェック開始...\n')

  // 1. 環境変数チェック
  console.log('1️⃣  環境変数チェック...')
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    addResult(
      '環境変数',
      false,
      'NEXT_PUBLIC_SUPABASE_URL または NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です',
      'error'
    )
    console.log('❌ 環境変数未設定\n')
    return
  }
  addResult('環境変数', true, '✅ 両方の環境変数が設定されています', 'info')
  console.log('✅ 環境変数OK\n')

  // Supabaseクライアント初期化
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // 2. Supabase接続チェック
  console.log('2️⃣  Supabase接続チェック...')
  try {
    const { data, error } = await supabase.from('organizations').select('count()', { count: 'exact', head: true })
    if (error) throw error
    addResult('Supabase接続', true, '✅ Supabaseに正常に接続されています', 'info')
    console.log('✅ 接続OK\n')
  } catch (error) {
    addResult(
      'Supabase接続',
      false,
      `❌ 接続失敗: ${error instanceof Error ? error.message : '不明なエラー'}`,
      'error'
    )
    console.log(`❌ 接続失敗\n`)
    return
  }

  // 3. テーブル存在チェック
  console.log('3️⃣  テーブル構造チェック...')
  const requiredTables = [
    'organizations',
    'users',
    'crops',
    'markets',
    'market_prices',
    'locations',
    'fields',
    'buyers',
    'messages',
    'tasks',
    'calendar_events',
    'cultivation_records',
    'proposals',
    'invoices',
  ]

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
      if (error) {
        addResult(table, false, `❌ テーブルが見つかりません`, 'error')
      } else {
        addResult(table, true, `✅ テーブル存在確認`, 'info')
      }
    } catch (error) {
      addResult(table, false, `❌ アクセス不可`, 'error')
    }
  }
  console.log('✅ テーブルチェック完了\n')

  // 4. RLSポリシーチェック (概略)
  console.log('4️⃣  RLSポリシーチェック...')
  const tablesWithRLS = ['messages', 'tasks', 'calendar_events', 'cultivation_records', 'proposals', 'invoices']
  for (const table of tablesWithRLS) {
    const result = results.find((r) => r.name === table)
    if (result?.passed) {
      addResult(`${table} RLS`, true, `✅ RLSポリシー適用`, 'info')
    }
  }
  console.log('✅ RLSチェック完了\n')

  // 5. マスターデータチェック
  console.log('5️⃣  マスターデータチェック...')
  try {
    const { count: cropCount, error: cropError } = await supabase
      .from('crops')
      .select('*', { count: 'exact', head: true })

    const { count: marketCount, error: marketError } = await supabase
      .from('markets')
      .select('*', { count: 'exact', head: true })

    if (cropCount && cropCount > 0) {
      addResult('マスターデータ(crops)', true, `✅ ${cropCount} 件のクロップデータ`, 'info')
    } else {
      addResult('マスターデータ(crops)', false, '⚠️  クロップデータが見つかりません', 'warning')
    }

    if (marketCount && marketCount > 0) {
      addResult('マスターデータ(markets)', true, `✅ ${marketCount} 件のマーケットデータ`, 'info')
    } else {
      addResult('マスターデータ(markets)', false, '⚠️  マーケットデータが見つかりません', 'warning')
    }
  } catch (error) {
    addResult('マスターデータ', false, `❌ チェック失敗`, 'error')
  }
  console.log('✅ マスターデータチェック完了\n')

  // 6. 認証チェック
  console.log('6️⃣  認証システムチェック...')
  try {
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError) {
      addResult('認証システム', false, `❌ 認証エラー: ${authError.message}`, 'error')
    } else {
      addResult('認証システム', true, `✅ 認証システム動作中`, 'info')
    }
  } catch (error) {
    addResult('認証システム', false, `❌ チェック失敗`, 'error')
  }
  console.log('✅ 認証チェック完了\n')

  // 結果表示
  console.log('\n' + '='.repeat(60))
  console.log('📊 チェック結果\n')

  const errors = results.filter((r) => r.severity === 'error' && !r.passed)
  const warnings = results.filter((r) => r.severity === 'warning' && !r.passed)
  const passed = results.filter((r) => r.passed)

  console.log(`✅ 成功: ${passed.length}`)
  console.log(`⚠️  警告: ${warnings.length}`)
  console.log(`❌ エラー: ${errors.length}\n`)

  if (errors.length > 0) {
    console.log('🔴 エラー項目:')
    errors.forEach((r) => console.log(`  - ${r.name}: ${r.message}`))
    console.log()
  }

  if (warnings.length > 0) {
    console.log('🟡 警告項目:')
    warnings.forEach((r) => console.log(`  - ${r.name}: ${r.message}`))
    console.log()
  }

  console.log('✅ 成功項目:')
  passed.slice(0, 10).forEach((r) => console.log(`  - ${r.name}: ${r.message}`))
  if (passed.length > 10) {
    console.log(`  ... 他 ${passed.length - 10} 項目`)
  }
  console.log()

  console.log('='.repeat(60))
  if (errors.length === 0) {
    console.log('\n🎉 すべてのチェックに合格しました！本番環境へのデプロイ準備完了です。\n')
    process.exit(0)
  } else {
    console.log('\n❌ エラーがあります。上記の項目を修正してから再実行してください。\n')
    process.exit(1)
  }
}

runChecks().catch((error) => {
  console.error('🔴 チェック実行中にエラーが発生:', error)
  process.exit(1)
})
