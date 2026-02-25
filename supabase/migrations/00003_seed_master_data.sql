-- APE Master Data Seed
-- Created: 2026-02-04
-- Description: Initial crop and market data for the application

-- ============================================
-- Crops Master Data (Japanese Agricultural Crops)
-- ============================================
INSERT INTO crops (id, name, name_en, season, category, planting_months, harvest_months, optimal_temp_min, optimal_temp_max, frost_tolerance, revenue_per_unit, cost_per_unit, difficulty, water_requirement, suitable_soil_ph_min, suitable_soil_ph_max, rotation_avoid, description) VALUES

-- Summer Vegetables (夏野菜)
('tomato', 'トマト', 'Tomato', 'summer', 'fruit_vegetables', ARRAY[3,4,5], ARRAY[6,7,8,9], 20, 30, 'low', 800000, 350000, 3, 'medium', 6.0, 6.8, ARRAY['tomato', 'eggplant', 'pepper'], '夏の定番野菜。施設栽培で周年出荷可能。'),
('eggplant', 'ナス', 'Eggplant', 'summer', 'fruit_vegetables', ARRAY[3,4,5], ARRAY[6,7,8,9,10], 22, 30, 'low', 600000, 280000, 2, 'high', 6.0, 6.8, ARRAY['tomato', 'eggplant', 'pepper'], '京野菜として人気。水分管理が重要。'),
('cucumber', 'キュウリ', 'Cucumber', 'summer', 'fruit_vegetables', ARRAY[4,5], ARRAY[6,7,8], 20, 28, 'low', 550000, 250000, 2, 'high', 6.0, 7.0, ARRAY['cucumber', 'melon', 'watermelon'], '生育が早く回転が良い。鮮度が重要。'),
('pepper', 'ピーマン', 'Bell Pepper', 'summer', 'fruit_vegetables', ARRAY[3,4,5], ARRAY[6,7,8,9,10], 22, 30, 'low', 500000, 220000, 2, 'medium', 6.0, 6.8, ARRAY['tomato', 'eggplant', 'pepper'], '栽培期間が長く、収量が安定。'),
('bitter_melon', 'ゴーヤ', 'Bitter Melon', 'summer', 'fruit_vegetables', ARRAY[4,5], ARRAY[7,8,9], 25, 30, 'low', 450000, 180000, 2, 'medium', 6.0, 6.5, ARRAY[]::TEXT[], '沖縄野菜として人気上昇中。暑さに強い。'),
('okra', 'オクラ', 'Okra', 'summer', 'fruit_vegetables', ARRAY[4,5], ARRAY[7,8,9], 25, 30, 'low', 400000, 150000, 1, 'medium', 6.0, 6.8, ARRAY[]::TEXT[], '比較的栽培が容易。連作障害少ない。'),
('corn', 'トウモロコシ', 'Sweet Corn', 'summer', 'grain_vegetables', ARRAY[4,5], ARRAY[7,8], 20, 30, 'low', 350000, 150000, 1, 'medium', 5.5, 7.0, ARRAY[]::TEXT[], '直売所で人気。鮮度重視の品目。'),
('edamame', '枝豆', 'Edamame', 'summer', 'bean_vegetables', ARRAY[4,5], ARRAY[7,8], 20, 28, 'low', 400000, 180000, 2, 'medium', 6.0, 6.8, ARRAY['edamame'], '夏のビール需要で人気。窒素固定で土壌改良効果。'),
('watermelon', 'スイカ', 'Watermelon', 'summer', 'fruit_vegetables', ARRAY[3,4], ARRAY[7,8], 25, 30, 'low', 700000, 350000, 3, 'medium', 5.5, 6.5, ARRAY['cucumber', 'melon', 'watermelon'], '高価格帯商品。広い面積が必要。'),
('melon', 'メロン', 'Melon', 'summer', 'fruit_vegetables', ARRAY[3,4], ARRAY[6,7,8], 25, 30, 'low', 1200000, 600000, 4, 'medium', 6.0, 6.8, ARRAY['cucumber', 'melon', 'watermelon'], '高級果物。技術力が収益に直結。'),

-- Winter Vegetables (冬野菜)
('winter_spinach', '冬ほうれん草', 'Winter Spinach', 'winter', 'leaf_vegetables', ARRAY[9,10,11], ARRAY[11,12,1,2], 15, 20, 'high', 450000, 180000, 2, 'medium', 6.5, 7.5, ARRAY['spinach'], '寒締めで甘みが増す。回転が早い。'),
('komatsuna', '小松菜', 'Komatsuna', 'winter', 'leaf_vegetables', ARRAY[9,10,11], ARRAY[10,11,12,1,2], 15, 25, 'high', 400000, 160000, 1, 'medium', 6.0, 7.0, ARRAY[]::TEXT[], '周年栽培可能。需要安定。'),
('hakusai', '白菜', 'Chinese Cabbage', 'winter', 'leaf_vegetables', ARRAY[8,9], ARRAY[11,12,1], 15, 20, 'high', 300000, 120000, 2, 'high', 6.0, 7.0, ARRAY['hakusai', 'cabbage'], '鍋需要で冬場人気。大型野菜で運搬注意。'),
('daikon', '大根', 'Daikon Radish', 'winter', 'root_vegetables', ARRAY[8,9], ARRAY[11,12,1], 15, 20, 'high', 280000, 100000, 1, 'medium', 6.0, 7.0, ARRAY['daikon', 'turnip'], '家庭需要安定。保存性良好。'),
('turnip', 'カブ', 'Turnip', 'winter', 'root_vegetables', ARRAY[9,10], ARRAY[11,12,1], 15, 20, 'high', 350000, 130000, 1, 'medium', 6.0, 7.0, ARRAY['daikon', 'turnip'], '漬物需要あり。京野菜品種で高価格。'),
('negi', 'ネギ', 'Japanese Leek', 'winter', 'allium_vegetables', ARRAY[4,5,9], ARRAY[11,12,1,2,3], 15, 20, 'very_high', 500000, 200000, 2, 'medium', 6.0, 7.0, ARRAY['negi', 'onion'], '周年需要。白ネギ・青ネギで市場が異なる。'),
('broccoli', 'ブロッコリー', 'Broccoli', 'winter', 'flower_vegetables', ARRAY[7,8], ARRAY[11,12,1,2], 15, 20, 'high', 550000, 220000, 2, 'medium', 6.0, 7.0, ARRAY['broccoli', 'cabbage'], '健康野菜として人気上昇。側花蕾も収穫可能。'),
('cabbage', 'キャベツ', 'Cabbage', 'winter', 'leaf_vegetables', ARRAY[7,8,9], ARRAY[11,12,1,2,3], 15, 20, 'high', 280000, 100000, 1, 'medium', 6.0, 7.5, ARRAY['hakusai', 'cabbage', 'broccoli'], '需要安定。加工業務用も。');

-- ============================================
-- Markets Master Data (Major Japanese Markets)
-- ============================================
INSERT INTO markets (id, name, location) VALUES
('osaka_honba', '大阪本場', '大阪府大阪市'),
('tokyo_ota', '東京大田', '東京都大田区'),
('nagoya_kitabu', '名古屋北部', '愛知県名古屋市'),
('sapporo_chuo', '札幌中央', '北海道札幌市'),
('fukuoka_chuo', '福岡中央', '福岡県福岡市'),
('sendai_chuo', '仙台中央', '宮城県仙台市'),
('hiroshima_chuo', '広島中央', '広島県広島市'),
('kyoto_chuo', '京都中央', '京都府京都市');

-- ============================================
-- Sample Market Prices (Recent 30 days)
-- Generated for demonstration purposes
-- ============================================

-- Function to generate sample price data
DO $$
DECLARE
  crop_record RECORD;
  market_record RECORD;
  v_date DATE;
  base_price INTEGER;
  daily_variation DECIMAL;
BEGIN
  FOR crop_record IN SELECT id, revenue_per_unit FROM crops LOOP
    base_price := (crop_record.revenue_per_unit / 1000)::INTEGER;

    FOR market_record IN SELECT id FROM markets LOOP
      FOR i IN 0..29 LOOP
        v_date := CURRENT_DATE - i;
        daily_variation := 1 + (random() * 0.3 - 0.15);

        INSERT INTO market_prices (market_id, crop_id, price_date, price)
        VALUES (
          market_record.id,
          crop_record.id,
          v_date,
          (base_price * daily_variation)::INTEGER
        )
        ON CONFLICT (market_id, crop_id, price_date) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
