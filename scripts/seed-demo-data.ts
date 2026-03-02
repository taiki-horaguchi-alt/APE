#!/usr/bin/env ts-node
/**
 * Seed Demo Data for APE
 *
 * このスクリプトは、APE のデモンストレーション用のサンプルデータを生成します。
 * ユーザーはこのデータを使用してアプリケーションを操作できます。
 *
 * Usage:
 *   npx ts-node scripts/seed-demo-data.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface DemoData {
  organizationId: string
  userId: string
  email: string
}

async function seedDemoData() {
  try {
    console.log('🌱 APE Demo Data Seeding Started...\n')

    // 1. テスト組織を作成
    console.log('📊 Creating demo organization...')
    const org = await supabase
      .from('organizations')
      .insert([
        {
          name: 'デモファーム Aグループ',
          industry: 'agriculture',
        }
      ])
      .select('id')
      .single()

    if (org.error) {
      console.error('Failed to create organization:', org.error)
      return
    }

    const organizationId = org.data.id
    console.log(`✅ Organization created: ${organizationId}\n`)

    // 2. サンプル栽培記録を作成
    console.log('🌾 Creating cultivation records...')
    const crops = ['tomato', 'eggplant', 'cucumber', 'pepper']
    const today = new Date()

    const cultivationRecords = crops.map((crop, idx) => ({
      organization_id: organizationId,
      crop_id: crop,
      field_name: `畑 ${String.fromCharCode(65 + idx)}`,
      area_m2: 500 + idx * 100,
      planted_date: new Date(today.getFullYear(), today.getMonth() - 2, 1),
      expected_harvest_date: new Date(today.getFullYear(), today.getMonth() + 1, 15),
      planting_method: ['直播き', '移植', '接ぎ木'][idx % 3],
      fertilizer_type: 'organic',
      status: ['preparing', 'growing', 'harvesting', 'completed'][idx],
      estimated_yield_kg: 2000 + idx * 500,
      estimated_revenue: 800000 + idx * 200000,
    }))

    const cultivationResult = await supabase
      .from('cultivation_records')
      .insert(cultivationRecords)

    if (cultivationResult.error) {
      console.error('Failed to create cultivation records:', cultivationResult.error)
    } else {
      console.log(`✅ ${cultivationRecords.length} cultivation records created\n`)
    }

    // 3. サンプル取引先を作成
    console.log('🏪 Creating buyers (trading partners)...')
    const buyers = [
      {
        organization_id: organizationId,
        name: '大阪青果市場',
        contact_person: '田中太郎',
        email: 'tanaka@osaka-market.jp',
        phone: '06-1234-5678',
        address: '大阪府大阪市北区',
        buyer_type: 'wholesaler',
        status: 'active',
      },
      {
        organization_id: organizationId,
        name: 'スーパー野菜館',
        contact_person: '佐藤花子',
        email: 'sato@yasai-kan.jp',
        phone: '06-8765-4321',
        address: '大阪府堺市中区',
        buyer_type: 'retailer',
        status: 'active',
      },
      {
        organization_id: organizationId,
        name: 'レストラン京都',
        contact_person: '山田次郎',
        email: 'yamada@kyoto-restaurant.jp',
        phone: '075-1234-5678',
        address: '京都府京都市中京区',
        buyer_type: 'restaurant',
        status: 'active',
      },
      {
        organization_id: organizationId,
        name: '有機野菜配送センター',
        contact_person: '鈴木美咲',
        email: 'suzuki@organic-delivery.jp',
        phone: '090-1234-5678',
        address: '大阪府吹田市',
        buyer_type: 'distributor',
        status: 'inactive',
      },
    ]

    const buyersResult = await supabase
      .from('buyers')
      .insert(buyers)
      .select('id')

    if (buyersResult.error) {
      console.error('Failed to create buyers:', buyersResult.error)
    } else {
      console.log(`✅ ${buyers.length} buyers created\n`)
    }

    // 4. サンプルメッセージを作成
    console.log('💬 Creating messages...')
    if (buyersResult.data && buyersResult.data.length > 0) {
      const messages = [
        {
          organization_id: organizationId,
          buyer_id: buyersResult.data[0].id,
          sender_id: organizationId, // User ID would be used in real scenario
          content: '来週のトマト納品について確認です。金曜日までに500kg用意できますか？',
          is_read: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          organization_id: organizationId,
          buyer_id: buyersResult.data[0].id,
          sender_id: buyersResult.data[0].id,
          content: 'かしこまりました。金曜日までに対応します。品質の方も優良品を選別します。',
          is_read: true,
          created_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        },
        {
          organization_id: organizationId,
          buyer_id: buyersResult.data[1].id,
          sender_id: organizationId,
          content: 'ナスの在庫状況を教えてください。',
          is_read: false,
          created_at: new Date(Date.now() - 30 * 60 * 1000),
        },
      ]

      const messagesResult = await supabase
        .from('messages')
        .insert(messages)

      if (messagesResult.error) {
        console.error('Failed to create messages:', messagesResult.error)
      } else {
        console.log(`✅ ${messages.length} messages created\n`)
      }
    }

    // 5. サンプルタスクを作成
    console.log('✅ Creating tasks...')
    const tasks = [
      {
        organization_id: organizationId,
        title: 'トマト畑の肥料散布',
        description: '畑Aのトマトに追肥を行う。窒素肥料中心。',
        category: 'farm_work',
        status: 'completed',
        priority: 'high',
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completed_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        organization_id: organizationId,
        title: 'きゅうりの収穫',
        description: '畑Cのキュウリを明日朝6時から収穫開始',
        category: 'farm_work',
        status: 'in_progress',
        priority: 'urgent',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        organization_id: organizationId,
        title: '大阪市場への出荷準備',
        description: 'トマト500kg、ナス300kgを梱包して発送準備',
        category: 'shipment',
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        organization_id: organizationId,
        title: '販売レポートの作成',
        description: '先月の販売実績をまとめてレポート作成',
        category: 'admin',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    ]

    const tasksResult = await supabase
      .from('tasks')
      .insert(tasks)

    if (tasksResult.error) {
      console.error('Failed to create tasks:', tasksResult.error)
    } else {
      console.log(`✅ ${tasks.length} tasks created\n`)
    }

    // 6. サンプル提案書を作成
    console.log('📄 Creating proposals...')
    if (buyersResult.data && buyersResult.data.length > 0) {
      const proposals = [
        {
          organization_id: organizationId,
          buyer_id: buyersResult.data[0].id,
          title: '3月度 トマト・ナス供給提案',
          description: '高品質の有機栽培トマト・ナスを月単位で安定供給いたします。',
          template_type: 'monthly_supply',
          status: 'accepted',
          proposed_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          valid_until: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
          items: [
            { crop: 'トマト', quantity: 500, unit: 'kg', unit_price: 800 },
            { crop: 'ナス', quantity: 300, unit: 'kg', unit_price: 600 },
          ],
          total_amount: 580000,
        },
        {
          organization_id: organizationId,
          buyer_id: buyersResult.data[1].id,
          title: '2月度 季節野菜詰め合わせ',
          description: 'その月の旬の野菜を詰め合わせた商品です。',
          template_type: 'seasonal_assortment',
          status: 'pending',
          proposed_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          valid_until: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          items: [
            { crop: 'キュウリ', quantity: 100, unit: 'kg', unit_price: 550 },
            { crop: 'ピーマン', quantity: 80, unit: 'kg', unit_price: 500 },
            { crop: 'オクラ', quantity: 50, unit: 'kg', unit_price: 400 },
          ],
          total_amount: 150500,
        },
      ]

      const proposalsResult = await supabase
        .from('proposals')
        .insert(proposals)

      if (proposalsResult.error) {
        console.error('Failed to create proposals:', proposalsResult.error)
      } else {
        console.log(`✅ ${proposals.length} proposals created\n`)
      }
    }

    // 7. サンプル請求書を作成
    console.log('🧾 Creating invoices...')
    if (buyersResult.data && buyersResult.data.length > 0) {
      const invoices = [
        {
          organization_id: organizationId,
          buyer_id: buyersResult.data[0].id,
          invoice_number: 'INV-2026-001',
          invoice_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          items: [
            { description: 'トマト Aグレード', quantity: 300, unit: 'kg', unit_price: 800 },
            { description: 'ナス 秀品', quantity: 200, unit: 'kg', unit_price: 600 },
          ],
          subtotal: 360000,
          tax_rate: 0.1,
          tax_amount: 36000,
          total_amount: 396000,
          status: 'paid',
          payment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          notes: '品質優良。次月も同等品を期待します。',
        },
        {
          organization_id: organizationId,
          buyer_id: buyersResult.data[1].id,
          invoice_number: 'INV-2026-002',
          invoice_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          due_date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
          items: [
            { description: 'キュウリ', quantity: 200, unit: 'kg', unit_price: 550 },
            { description: 'ピーマン', quantity: 150, unit: 'kg', unit_price: 500 },
          ],
          subtotal: 185000,
          tax_rate: 0.1,
          tax_amount: 18500,
          total_amount: 203500,
          status: 'unpaid',
          notes: '請求中',
        },
      ]

      const invoicesResult = await supabase
        .from('invoices')
        .insert(invoices)

      if (invoicesResult.error) {
        console.error('Failed to create invoices:', invoicesResult.error)
      } else {
        console.log(`✅ ${invoices.length} invoices created\n`)
      }
    }

    console.log('✨ Demo data seeding completed successfully!')
    console.log('\n📝 Summary:')
    console.log(`  - Organization ID: ${organizationId}`)
    console.log(`  - Cultivation Records: ${cultivationRecords.length}`)
    console.log(`  - Buyers: ${buyers.length}`)
    console.log(`  - Tasks: ${tasks.length}`)
    console.log(`\n🚀 You can now log in and explore the demo data!\n`)

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  }
}

// Run the seeding
seedDemoData()
