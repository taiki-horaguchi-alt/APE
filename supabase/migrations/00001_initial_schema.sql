-- APE (Agri-Tech Planning Engine) Initial Database Schema
-- Created: 2026-02-04
-- Description: Core tables for multi-platform agricultural management app

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geographic data

-- ============================================
-- 1. Organizations (Farm Teams)
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Users (Farm Members)
-- Extends Supabase auth.users
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  farm_name TEXT NOT NULL,
  avatar_url TEXT,
  labor_type TEXT CHECK (labor_type IN ('solo', 'partner', 'family_employees')),
  work_hours TEXT CHECK (work_hours IN ('full_time', 'part_time')),
  interested_crops TEXT[] DEFAULT '{}',
  role TEXT CHECK (role IN ('owner', 'manager', 'member')) DEFAULT 'member',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Locations (Geographic Areas)
-- ============================================
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  elevation INTEGER, -- meters
  climate_zone TEXT,
  annual_temp DECIMAL(4, 1), -- Celsius
  annual_rainfall INTEGER, -- mm
  snow_days INTEGER,
  frost_free_days INTEGER,
  soil_type TEXT,
  main_crops TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  description TEXT,

  -- Sync metadata
  version INTEGER DEFAULT 1,
  local_id TEXT, -- Client-generated ID for offline creates
  last_modified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete for sync
);

-- ============================================
-- 4. Soil Profiles
-- ============================================
CREATE TABLE soil_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  soil_type TEXT,

  -- Soil metrics stored as JSONB for flexibility
  -- Structure: { pH, EC, CEC, organicMatter, nitrogen, phosphorus, potassium, calcium, magnesium, drainage }
  metrics JSONB NOT NULL DEFAULT '{}',

  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  recommendation TEXT,
  source TEXT CHECK (source IN ('satellite', 'iot', 'manual')) DEFAULT 'manual',

  -- Sync metadata
  version INTEGER DEFAULT 1,
  local_id TEXT,
  last_modified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- 5. Fields (Individual Farm Plots)
-- ============================================
CREATE TABLE fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  soil_profile_id UUID REFERENCES soil_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,

  -- GeoJSON polygon for map display
  polygon JSONB, -- Array of {latitude, longitude} coordinates

  area_size DECIMAL(10, 2), -- In 10a (are) units

  -- Sync metadata
  version INTEGER DEFAULT 1,
  local_id TEXT,
  last_modified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- 6. Crops (Master Data - Read Only for clients)
-- ============================================
CREATE TABLE crops (
  id TEXT PRIMARY KEY, -- e.g., 'tomato', 'winter_spinach'
  name TEXT NOT NULL, -- Japanese name
  name_en TEXT, -- English name
  season TEXT CHECK (season IN ('summer', 'winter')),
  category TEXT,
  planting_months INTEGER[] DEFAULT '{}', -- 1-12
  harvest_months INTEGER[] DEFAULT '{}', -- 1-12
  optimal_temp_min INTEGER,
  optimal_temp_max INTEGER,
  frost_tolerance TEXT CHECK (frost_tolerance IN ('low', 'medium', 'high', 'very_high')),
  revenue_per_unit INTEGER, -- JPY per 10a
  cost_per_unit INTEGER, -- JPY per 10a
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  water_requirement TEXT CHECK (water_requirement IN ('low', 'medium', 'high')),
  suitable_soil_ph_min DECIMAL(3, 1),
  suitable_soil_ph_max DECIMAL(3, 1),
  rotation_avoid TEXT[] DEFAULT '{}', -- Crop IDs to avoid in rotation
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. Buyers (Sales Channels)
-- ============================================
CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('restaurant', 'hotel', 'chain_hq', 'direct_sales', 'ja', 'market', 'supermarket')),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  distance TEXT, -- e.g., "5km"
  demand_crops TEXT[] DEFAULT '{}', -- Crop IDs
  price_level TEXT CHECK (price_level IN ('low', 'medium', 'medium_high', 'high')),
  contact TEXT,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  monthly_volume INTEGER, -- kg
  description TEXT,

  -- Sync metadata
  version INTEGER DEFAULT 1,
  local_id TEXT,
  last_modified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- 8. Simulations (Saved Scenarios)
-- ============================================
CREATE TABLE simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  summer_crop_id TEXT REFERENCES crops(id),
  winter_crop_id TEXT REFERENCES crops(id),
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  area_size DECIMAL(10, 2), -- In 10a units

  -- Risk scenarios as JSONB
  -- Structure: [{ id, name, impactPercent, enabled }]
  risk_scenarios JSONB DEFAULT '[]',

  -- Simulation result as JSONB
  -- Structure: { totalRevenue, totalCost, totalProfit, profitMargin, monthlyData, alerts }
  result JSONB,

  notes TEXT,

  -- Sync metadata
  version INTEGER DEFAULT 1,
  local_id TEXT,
  last_modified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- 9. Market Prices (Read-only reference data)
-- ============================================
CREATE TABLE markets (
  id TEXT PRIMARY KEY, -- e.g., 'osaka_honba'
  name TEXT NOT NULL, -- e.g., '大阪本場'
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE market_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id TEXT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  crop_id TEXT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  price_date DATE NOT NULL,
  price INTEGER NOT NULL, -- JPY per kg
  unit TEXT DEFAULT 'kg',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(market_id, crop_id, price_date)
);

-- ============================================
-- 10. Sync Queue (Offline Operations)
-- ============================================
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  operation TEXT CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  data JSONB,
  status TEXT CHECK (status IN ('pending', 'synced', 'conflict', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- ============================================
-- 11. Audit Log (Financial Data Tracking)
-- ============================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Organizations
CREATE INDEX idx_organizations_name ON organizations(name);

-- Users
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);

-- Locations
CREATE INDEX idx_locations_organization ON locations(organization_id);
CREATE INDEX idx_locations_prefecture ON locations(prefecture);
CREATE INDEX idx_locations_deleted ON locations(deleted_at) WHERE deleted_at IS NULL;

-- Soil Profiles
CREATE INDEX idx_soil_profiles_organization ON soil_profiles(organization_id);
CREATE INDEX idx_soil_profiles_location ON soil_profiles(location_id);
CREATE INDEX idx_soil_profiles_deleted ON soil_profiles(deleted_at) WHERE deleted_at IS NULL;

-- Fields
CREATE INDEX idx_fields_organization ON fields(organization_id);
CREATE INDEX idx_fields_location ON fields(location_id);
CREATE INDEX idx_fields_deleted ON fields(deleted_at) WHERE deleted_at IS NULL;

-- Crops
CREATE INDEX idx_crops_season ON crops(season);
CREATE INDEX idx_crops_category ON crops(category);
CREATE INDEX idx_crops_active ON crops(is_active) WHERE is_active = TRUE;

-- Buyers
CREATE INDEX idx_buyers_organization ON buyers(organization_id);
CREATE INDEX idx_buyers_type ON buyers(type);
CREATE INDEX idx_buyers_deleted ON buyers(deleted_at) WHERE deleted_at IS NULL;

-- Simulations
CREATE INDEX idx_simulations_organization ON simulations(organization_id);
CREATE INDEX idx_simulations_user ON simulations(user_id);
CREATE INDEX idx_simulations_deleted ON simulations(deleted_at) WHERE deleted_at IS NULL;

-- Market Prices
CREATE INDEX idx_market_prices_market ON market_prices(market_id);
CREATE INDEX idx_market_prices_crop ON market_prices(crop_id);
CREATE INDEX idx_market_prices_date ON market_prices(price_date DESC);

-- Sync Queue
CREATE INDEX idx_sync_queue_status ON sync_queue(status) WHERE status = 'pending';
CREATE INDEX idx_sync_queue_user ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_device ON sync_queue(device_id);

-- Audit Log
CREATE INDEX idx_audit_log_organization ON audit_log(organization_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- ============================================
-- Updated_at Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_soil_profiles_updated_at BEFORE UPDATE ON soil_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_simulations_updated_at BEFORE UPDATE ON simulations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Audit Log Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (organization_id, user_id, table_name, record_id, action, new_data)
    VALUES (NEW.organization_id, auth.uid(), TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (organization_id, user_id, table_name, record_id, action, old_data, new_data)
    VALUES (NEW.organization_id, auth.uid(), TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (organization_id, user_id, table_name, record_id, action, old_data)
    VALUES (OLD.organization_id, auth.uid(), TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to financial-related tables
CREATE TRIGGER audit_simulations AFTER INSERT OR UPDATE OR DELETE ON simulations FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_fields AFTER INSERT OR UPDATE OR DELETE ON fields FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
