-- APE Demo Data Seeding Script
-- Supabase SQL Editor から実行してください
-- このスクリプトは、デモンストレーション用のサンプルデータを生成します

-- ============================================
-- 1. テスト組織を作成
-- ============================================
INSERT INTO organizations (name, description)
VALUES ('デモファーム Aグループ', 'デモンストレーション用の農業経営組織')
ON CONFLICT DO NOTHING;

-- 組織IDを取得（以下のクエリで使用）
-- SELECT id FROM organizations WHERE name = 'デモファーム Aグループ';

-- ============================================
-- 2. サンプル栽培記録を作成
-- ============================================
INSERT INTO cultivation_records (
  organization_id,
  crop_id,
  field_name,
  area_m2,
  planted_date,
  expected_harvest_date,
  planting_method,
  fertilizer_type,
  status,
  estimated_yield_kg,
  estimated_revenue
)
SELECT
  (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ') as org_id,
  crop_id,
  field_name,
  area_m2,
  planted_date,
  expected_harvest_date,
  planting_method,
  fertilizer_type,
  status,
  estimated_yield_kg,
  estimated_revenue
FROM (
  VALUES
    ('tomato', '畑 A', 500, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', '直播き', 'organic', 'growing', 2000, 800000),
    ('eggplant', '畑 B', 600, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', '移植', 'organic', 'harvesting', 2500, 1000000),
    ('cucumber', '畑 C', 700, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', '接ぎ木', 'organic', 'completed', 3000, 1200000),
    ('pepper', '畑 D', 800, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', '移植', 'organic', 'preparing', 3500, 1400000)
) AS t(crop_id, field_name, area_m2, planted_date, expected_harvest_date, planting_method, fertilizer_type, status, estimated_yield_kg, estimated_revenue)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. サンプル取引先を作成
-- ============================================
INSERT INTO buyers (
  organization_id,
  name,
  contact_person,
  email,
  phone,
  address,
  type,
  status
)
SELECT
  (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ') as org_id,
  name,
  contact_person,
  email,
  phone,
  address,
  type,
  status
FROM (
  VALUES
    ('大阪青果市場', '田中太郎', 'tanaka@osaka-market.jp', '06-1234-5678', '大阪府大阪市北区', 'wholesaler', 'active'),
    ('スーパー野菜館', '佐藤花子', 'sato@yasai-kan.jp', '06-8765-4321', '大阪府堺市中区', 'supermarket', 'active'),
    ('レストラン京都', '山田次郎', 'yamada@kyoto-restaurant.jp', '075-1234-5678', '京都府京都市中京区', 'restaurant', 'active'),
    ('有機野菜配送センター', '鈴木美咲', 'suzuki@organic-delivery.jp', '090-1234-5678', '大阪府吹田市', 'distributor', 'inactive')
) AS t(name, contact_person, email, phone, address, type, status)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. サンプルタスクを作成
-- ============================================
INSERT INTO tasks (
  organization_id,
  title,
  description,
  category,
  status,
  priority,
  due_date
)
SELECT
  (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ') as org_id,
  title,
  description,
  category,
  status,
  priority,
  due_date
FROM (
  VALUES
    ('トマト畑の肥料散布', '畑Aのトマトに追肥を行う。窒素肥料中心。', 'cultivation', 'completed', 'high', CURRENT_DATE - INTERVAL '3 days'),
    ('きゅうりの収穫', '畑Cのキュウリを明日朝6時から収穫開始', 'harvest', 'in_progress', 'urgent', CURRENT_DATE + INTERVAL '1 day'),
    ('大阪市場への出荷準備', 'トマト500kg、ナス300kgを梱包して発送準備', 'shipping', 'pending', 'high', CURRENT_DATE + INTERVAL '2 days'),
    ('販売レポートの作成', '先月の販売実績をまとめてレポート作成', 'admin', 'pending', 'medium', CURRENT_DATE + INTERVAL '5 days')
) AS t(title, description, category, status, priority, due_date)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. サンプル提案書を作成
-- ============================================
INSERT INTO proposals (
  organization_id,
  buyer_id,
  title,
  description,
  template_type,
  status,
  proposed_date,
  valid_until,
  items,
  total_amount
)
SELECT
  (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ') as org_id,
  (SELECT id FROM buyers WHERE name = '大阪青果市場' LIMIT 1) as buyer_id,
  '3月度 トマト・ナス供給提案',
  '高品質の有機栽培トマト・ナスを月単位で安定供給いたします。',
  'monthly_supply',
  'accepted',
  CURRENT_DATE - INTERVAL '20 days',
  CURRENT_DATE + INTERVAL '40 days',
  '[{"crop": "トマト", "quantity": 500, "unit": "kg", "unit_price": 800}, {"crop": "ナス", "quantity": 300, "unit": "kg", "unit_price": 600}]'::jsonb,
  580000
ON CONFLICT DO NOTHING;

INSERT INTO proposals (
  organization_id,
  buyer_id,
  title,
  description,
  template_type,
  status,
  proposed_date,
  valid_until,
  items,
  total_amount
)
SELECT
  (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ') as org_id,
  (SELECT id FROM buyers WHERE name = 'スーパー野菜館' LIMIT 1) as buyer_id,
  '2月度 季節野菜詰め合わせ',
  'その月の旬の野菜を詰め合わせた商品です。',
  'seasonal_assortment',
  'pending',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '25 days',
  '[{"crop": "キュウリ", "quantity": 100, "unit": "kg", "unit_price": 550}, {"crop": "ピーマン", "quantity": 80, "unit": "kg", "unit_price": 500}, {"crop": "オクラ", "quantity": 50, "unit": "kg", "unit_price": 400}]'::jsonb,
  150500
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. サンプル請求書を作成
-- ============================================
INSERT INTO invoices (
  organization_id,
  buyer_id,
  invoice_number,
  invoice_date,
  due_date,
  items,
  subtotal,
  tax_rate,
  tax_amount,
  total_amount,
  status,
  payment_date,
  notes
)
SELECT
  (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ') as org_id,
  (SELECT id FROM buyers WHERE name = '大阪青果市場' LIMIT 1) as buyer_id,
  'INV-2026-001',
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '15 days',
  '[{"description": "トマト Aグレード", "quantity": 300, "unit": "kg", "unit_price": 800}, {"description": "ナス 秀品", "quantity": 200, "unit": "kg", "unit_price": 600}]'::jsonb,
  360000,
  0.1,
  36000,
  396000,
  'paid',
  CURRENT_DATE - INTERVAL '5 days',
  '品質優良。次月も同等品を期待します。'
ON CONFLICT DO NOTHING;

INSERT INTO invoices (
  organization_id,
  buyer_id,
  invoice_number,
  invoice_date,
  due_date,
  items,
  subtotal,
  tax_rate,
  tax_amount,
  total_amount,
  status,
  notes
)
SELECT
  (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ') as org_id,
  (SELECT id FROM buyers WHERE name = 'スーパー野菜館' LIMIT 1) as buyer_id,
  'INV-2026-002',
  CURRENT_DATE - INTERVAL '8 days',
  CURRENT_DATE + INTERVAL '22 days',
  '[{"description": "キュウリ", "quantity": 200, "unit": "kg", "unit_price": 550}, {"description": "ピーマン", "quantity": 150, "unit": "kg", "unit_price": 500}]'::jsonb,
  185000,
  0.1,
  18500,
  203500,
  'unpaid',
  '請求中'
ON CONFLICT DO NOTHING;

-- ============================================
-- 確認クエリ
-- ============================================
SELECT
  (SELECT COUNT(*) FROM organizations WHERE name = 'デモファーム Aグループ')::text || ' organizations' as "結果",
  (SELECT COUNT(*) FROM cultivation_records WHERE organization_id = (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ'))::text || ' cultivation_records' as "栽培記録",
  (SELECT COUNT(*) FROM buyers WHERE organization_id = (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ'))::text || ' buyers' as "取引先",
  (SELECT COUNT(*) FROM tasks WHERE organization_id = (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ'))::text || ' tasks' as "タスク",
  (SELECT COUNT(*) FROM proposals WHERE organization_id = (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ'))::text || ' proposals' as "提案書",
  (SELECT COUNT(*) FROM invoices WHERE organization_id = (SELECT id FROM organizations WHERE name = 'デモファーム Aグループ'))::text || ' invoices' as "請求書"
;
