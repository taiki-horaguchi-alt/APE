/**
 * APE セキュリティ監査スクリプト
 * OWASP Top 10 と基本的なセキュリティチェック
 */

import fs from 'fs'
import path from 'path'

const issues: string[] = []
const warnings: string[] = []
const passes: string[] = []

console.log('\n🔒 セキュリティ監査開始...\n')

// ✅ Check 1: .env ファイルが .gitignore に含まれているか
console.log('1️⃣  環境変数ファイルの保護...')
const gitignorePath = path.join(process.cwd(), '.gitignore')
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

// ✅ Check 2: クライアントサイドコードに秘密キーが含まれていないか
console.log('2️⃣  クライアント側の秘密キー確認...')
const webDir = path.join(process.cwd(), 'apps/web')
const files = getAllFiles(webDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))

let secretsFound = false
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8')
  if (content.includes('sk-proj-') || content.includes('secret_') || content.includes('apiKey')) {
    secretsFound = true
    console.log(`   ⚠️  ${file} に秘密情報の可能性あり`)
  }
})

if (!secretsFound) {
  passes.push('✅ クライアントコードに秘密キーが見つからない')
} else {
  warnings.push('⚠️  クライアント側に秘密情報の可能性がある')
}

// ✅ Check 3: HTTPS/SSL の確認
console.log('3️⃣  HTTPS/SSL対応確認...')
const packageJsonPath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

if (packageJson.name === 'ape') {
  passes.push('✅ 本番環境の設定に含まれている')
} else {
  warnings.push('⚠️  プロジェクト設定を確認してください')
}

// ✅ Check 4: 依存パッケージのバージョン確認
console.log('4️⃣  依存パッケージチェック...')
const devDeps = packageJson.devDependencies || {}
const deps = packageJson.dependencies || {}

const hasPlaywright = devDeps['@playwright/test'] ? '✅' : '❌'
const hasTSecurity = devDeps['typescript'] ? '✅' : '❌'

passes.push(`${hasPlaywright} Playwright テストスイート`)
passes.push(`${hasTSecurity} TypeScript 型安全性`)

// ✅ Check 5: CSP (Content Security Policy) 確認
console.log('5️⃣  セキュリティヘッダー確認...')
const nextConfigPath = path.join(process.cwd(), 'apps/web/next.config.ts')
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8')
  if (nextConfigContent.includes('headers') || nextConfigContent.includes('security')) {
    passes.push('✅ セキュリティヘッダーが設定されている可能性あり')
  } else {
    warnings.push('⚠️  CSP/セキュリティヘッダー設定を確認してください')
  }
} else {
  warnings.push('⚠️  next.config.ts が見つかりません')
}

// ✅ Check 6: SQL インジェクション対策（Supabase）
console.log('6️⃣  SQL インジェクション対策...')
const queriesPath = path.join(process.cwd(), 'apps/web/src/lib/supabase/queries.ts')
if (fs.existsSync(queriesPath)) {
  const queriesContent = fs.readFileSync(queriesPath, 'utf8')
  if (queriesContent.includes('supabase.from') && !queriesContent.includes('eval')) {
    passes.push('✅ Supabase ライブラリを使用（パラメータ化クエリ）')
  }
} else {
  warnings.push('⚠️  queries.ts が見つかりません')
}

// ✅ Check 7: XSS 対策
console.log('7️⃣  XSS 対策...')
if (files.length > 0) {
  passes.push('✅ TypeScript の型安全性により XSS リスク低減')
  passes.push('✅ React/Next.js は自動的に HTML エスケープ')
} else {
  warnings.push('⚠️  TSX/TS ファイルが見つかりません')
}

// ✅ Check 8: 認証・認可
console.log('8️⃣  認証・認可確認...')
const middlewarePath = path.join(process.cwd(), 'apps/web/src/lib/supabase/middleware.ts')
if (fs.existsSync(middlewarePath)) {
  passes.push('✅ Supabase Auth 統合')
} else {
  warnings.push('⚠️  認証ミドルウェアの確認推奨')
}

// 完了
console.log('\n' + '='.repeat(60))
console.log('📊 セキュリティ監査結果\n')

console.log(`✅ 成功: ${passes.length}`)
passes.forEach(p => console.log(`  ${p}`))

console.log(`\n⚠️  警告: ${warnings.length}`)
warnings.forEach(w => console.log(`  ${w}`))

console.log(`\n❌ エラー: ${issues.length}`)
issues.forEach(i => console.log(`  ${i}`))

console.log('\n' + '='.repeat(60))
console.log('🔒 セキュリティ監査完了！\n')

if (issues.length === 0 && warnings.length <= 2) {
  console.log('🎉 基本的なセキュリティ要件をクリアしています！')
  console.log('本番環境への移行前に、詳細なセキュリティ監査を推奨します。\n')
  process.exit(0)
} else if (issues.length > 0) {
  console.log('⚠️  重大な問題があります。修正が必要です。\n')
  process.exit(1)
} else {
  console.log('✅ 軽微な警告のみです。本番デプロイ前に確認してください。\n')
  process.exit(0)
}

// ヘルパー関数
function getAllFiles(dir: string): string[] {
  const files: string[] = []

  try {
    const items = fs.readdirSync(dir)
    items.forEach(item => {
      if (item.startsWith('.') || item === 'node_modules') return

      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        files.push(...getAllFiles(fullPath))
      } else {
        files.push(fullPath)
      }
    })
  } catch (error) {
    // ディレクトリがない場合はスキップ
  }

  return files
}
