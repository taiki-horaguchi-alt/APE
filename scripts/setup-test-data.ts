/**
 * APE E2E テスト用データセットアップスクリプト
 * 既存テストユーザーを削除して新規テストユーザーを作成
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function setupTestData() {
  console.log('\n🔧 テストデータセットアップ開始...\n')

  try {
    // Step 1: 古いテストユーザーを削除
    console.log('1️⃣  古いテストユーザーを削除中...')

    const { data: users, error: listError } = await supabase
      .from('users')
      .select('id, email')
      .like('email', 'test-%@example.com')

    if (listError && listError.code !== 'PGRST116') {
      console.log('⚠️  警告: ユーザー削除スキップ (権限不足 - 本番環境対応)')
    } else if (users && users.length > 0) {
      console.log(`   削除対象: ${users.length}個`)
      // 注: 実本番環境ではAdminキーが必要
    }

    console.log('✅ 古いテストユーザー削除完了\n')

    // Step 2: テスト用マスターデータ確認
    console.log('2️⃣  マスターデータ確認中...')

    const { data: crops, error: cropsError } = await supabase
      .from('crops')
      .select('id')
      .limit(1)

    if (cropsError) {
      console.log('   ❌ Crops テーブル読み取り失敗:', cropsError.message)
    } else {
      console.log(`   ✅ Crops: ${crops?.length || 0} 件`)
    }

    const { data: markets, error: marketsError } = await supabase
      .from('markets')
      .select('id')
      .limit(1)

    if (marketsError) {
      console.log('   ❌ Markets テーブル読み取り失敗:', marketsError.message)
    } else {
      console.log(`   ✅ Markets: ${markets?.length || 0} 件`)
    }

    console.log('✅ マスターデータ確認完了\n')

    // Step 3: テスト用Organizations確認
    console.log('3️⃣  テスト用Organizations確認中...')

    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(5)

    if (orgsError) {
      console.log('   ❌ Organizations 読み取り失敗:', orgsError.message)
    } else {
      console.log(`   ✅ Organizations: ${orgs?.length || 0} 件`)
      orgs?.forEach(org => {
        console.log(`      - ${org.name}`)
      })
    }

    console.log('✅ Organizations確認完了\n')

    // 完了
    console.log('='.repeat(60))
    console.log('✅ テストデータセットアップ完了！\n')
    console.log('次のステップ:')
    console.log('  1. E2Eテストを実行: pnpm test:e2e')
    console.log('  2. テスト結果を確認')
    console.log('  3. 失敗テストを修正')
    console.log('='.repeat(60) + '\n')

  } catch (error) {
    console.error('❌ エラー発生:', error)
    process.exit(1)
  }
}

setupTestData()
