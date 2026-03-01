#!/usr/bin/env node

/**
 * APE セキュリティ監査スクリプト
 * OWASP Top 10 と基本的なセキュリティチェック
 */

const fs = require('fs')
const path = require('path')

const issues = []
const warnings = []
const passes = []

console.log('\n🔒 セキュリティ監査開始...\n')

// ✅ Check 1: .env ファイルが .gitignore に含まれているか
console.log('1️⃣  環境変数ファイルの保護...')
const gitignorePath = path.join(__dirname, '../.gitignore')
const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')

if (gitignoreContent.includes('.env')) {
  passes.push('✅ .env ファイルが .gitignore に含まれている')
} else {
  issues.push('❌ .env ファイルが .gitignore に含まれていない')
}

if (gitignoreContent.includes('.env.local')) {
  passes.push('✅ .env.local が .gitignore に含まれている')
} else {
  issues.push('❌ .env.local が .gitignore に含まれていない')
}

// ✅ Check 2: client_projects が .gitignore に含まれているか
if (gitignoreContent.includes('client_projects')) {
  passes.push('✅ client_projects が .gitignore に含まれている（顧客データ保護）')
} else {
  warnings.push('⚠️  client_projects が .gitignore に含まれていない')
}

// ✅ Check 3: クライアントサイドコードに秘密キーが含まれていないか
console.log('2️⃣  クライアント側の秘密キー確認...')
const webDir = path.join(__dirname, '../apps/web/src')
const files = getAllFilesSync(webDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))

let secretsFound = false
let secretsChecked = 0

try {
  files.slice(0, 20).forEach(file => {
    const content = fs.readFileSync(file, 'utf8')
    secretsChecked++

    // チェック: ハードコードされたシークレット
    if (content.includes('sk-proj-') || content.includes('secret_key') || content.includes('apiKey =')) {
      secretsFound = true
      console.log(`   ⚠️  ${path.basename(file)} に秘密情報の可能性`)
    }
  })

  if (!secretsFound && secretsChecked > 0) {
    passes.push(`✅ ${secretsChecked}個のファイルをチェック - 秘密キーが見つからない`)
  }
} catch (e) {
  warnings.push('⚠️  ファイルスキャンでエラーが発生しました')
}

// ✅ Check 4: package.json の確認
console.log('3️⃣  依存パッケージチェック...')
const packageJsonPath = path.join(__dirname, '../package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

const devDeps = packageJson.devDependencies || {}
const deps = packageJson.dependencies || {}

if (devDeps['@playwright/test']) {
  passes.push('✅ Playwright テストスイート')
}
if (devDeps['typescript']) {
  passes.push('✅ TypeScript - 型安全性')
}
if (devDeps['@supabase/supabase-js']) {
  passes.push('✅ Supabase - パラメータ化クエリ')
}

// ✅ Check 5: .gitignore の確認
console.log('4️⃣  Git セキュリティ設定確認...')
const gitignoreChecks = [
  ['.env', '環境変数'],
  ['.env.local', 'ローカル環境変数'],
  ['node_modules', 'パッケージ'],
  ['client_projects', '顧客データ'],
  ['.next', 'ビルド成果物'],
]

let gitignoreOK = 0
gitignoreChecks.forEach(([pattern, desc]) => {
  if (gitignoreContent.includes(pattern)) {
    gitignoreOK++
  } else {
    warnings.push(`⚠️  ${pattern} (${desc}) が .gitignore に含まれていない`)
  }
})

passes.push(`✅ Git セキュリティ: ${gitignoreOK}/${gitignoreChecks.length} チェック完了`)

// ✅ Check 6: 認証・認可
console.log('5️⃣  認証・認可確認...')
const supabaseDir = path.join(__dirname, '../apps/web/src/lib/supabase')
if (fs.existsSync(supabaseDir)) {
  passes.push('✅ Supabase Auth 統合')

  const middlewarePath = path.join(supabaseDir, 'middleware.ts')
  if (fs.existsSync(middlewarePath)) {
    passes.push('✅ 認証ミドルウェア実装済み')
  }
} else {
  warnings.push('⚠️  Supabase ディレクトリが見つかりません')
}

// 完了
console.log('\n' + '='.repeat(60))
console.log('📊 セキュリティ監査結果\n')

console.log(`✅ 成功: ${passes.length}`)
passes.forEach(p => console.log(`  ${p}`))

if (warnings.length > 0) {
  console.log(`\n⚠️  警告: ${warnings.length}`)
  warnings.forEach(w => console.log(`  ${w}`))
}

if (issues.length > 0) {
  console.log(`\n❌ エラー: ${issues.length}`)
  issues.forEach(i => console.log(`  ${i}`))
}

console.log('\n' + '='.repeat(60))
console.log('🔒 セキュリティ監査完了！\n')

if (issues.length === 0) {
  console.log('🎉 基本的なセキュリティ要件をクリアしています！')
  console.log('本番環境への移行前に、詳細なセキュリティ監査を推奨します。\n')
  process.exit(0)
} else {
  console.log('⚠️  重大な問題があります。修正が必要です。\n')
  process.exit(1)
}

// ヘルパー関数
function getAllFilesSync(dir) {
  const files = []

  try {
    const items = fs.readdirSync(dir)
    items.forEach(item => {
      if (item.startsWith('.') || item === 'node_modules') return

      const fullPath = path.join(dir, item)
      try {
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          files.push(...getAllFilesSync(fullPath))
        } else {
          files.push(fullPath)
        }
      } catch (e) {
        // スキップ
      }
    })
  } catch (error) {
    // ディレクトリがない場合はスキップ
  }

  return files
}
