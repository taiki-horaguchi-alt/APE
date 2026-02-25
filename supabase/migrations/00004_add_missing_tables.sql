-- APE Missing Tables
-- Created: 2026-02-23
-- Description: Add messages, cultivation_records, tasks, and calendar_events tables

-- ============================================
-- 1. Messages (Chat Communication)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Sync metadata
  version INTEGER DEFAULT 1,
  local_id TEXT,
  last_modified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- 2. Cultivation Records (作業記録)
-- ============================================
CREATE TABLE cultivation_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  crop_id TEXT REFERENCES crops(id) ON DELETE SET NULL,

  -- Record type: planting, fertilizer, pesticide, harvest, other
  type TEXT NOT NULL CHECK (type IN ('planting', 'fertilizer', 'pesticide', 'harvest', 'other')),

  record_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Type-specific fields
  pesticide_name TEXT,
  pesticide_usage_count INTEGER,
  fertilizer_name TEXT,
  fertilizer_quantity DECIMAL(10, 2),
  harvest_quantity DECIMAL(10, 2),
  harvest_unit TEXT,

  -- Media
  photo_url TEXT,
  voice_memo_url TEXT,

  -- Sync metadata
  version INTEGER DEFAULT 1,
  local_id TEXT,
  last_modified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- 3. Tasks (タスク管理)
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  crop_id TEXT REFERENCES crops(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,

  -- Status: todo, in_progress, done
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),

  -- Priority: low, medium, high, urgent
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Category: cultivation, harvest, shipping, maintenance, admin, other
  category TEXT DEFAULT 'other' CHECK (category IN ('cultivation', 'harvest', 'shipping', 'maintenance', 'admin', 'other')),

  due_date DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT, -- 'daily', 'weekly', 'monthly', etc.
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Sync metadata
  version INTEGER DEFAULT 1,
  local_id TEXT,
  last_modified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- 4. Calendar Events (カレンダーイベント)
-- ============================================
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  crop_id TEXT REFERENCES crops(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,

  -- Event type: planting, pesticide, fertilizer, harvest, shipping, maintenance, other
  type TEXT NOT NULL CHECK (type IN ('planting', 'pesticide', 'fertilizer', 'harvest', 'shipping', 'maintenance', 'other')),

  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,

  -- Linked to cultivation record or task
  cultivation_record_id UUID REFERENCES cultivation_records(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

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
-- Indexes for Performance
-- ============================================

-- Messages
CREATE INDEX idx_messages_organization ON messages(organization_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_buyer ON messages(buyer_id);
CREATE INDEX idx_messages_buyer_sender ON messages(buyer_id, sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_deleted ON messages(deleted_at) WHERE deleted_at IS NULL;

-- Cultivation Records
CREATE INDEX idx_cultivation_records_organization ON cultivation_records(organization_id);
CREATE INDEX idx_cultivation_records_field ON cultivation_records(field_id);
CREATE INDEX idx_cultivation_records_crop ON cultivation_records(crop_id);
CREATE INDEX idx_cultivation_records_type ON cultivation_records(type);
CREATE INDEX idx_cultivation_records_date ON cultivation_records(record_date DESC);
CREATE INDEX idx_cultivation_records_deleted ON cultivation_records(deleted_at) WHERE deleted_at IS NULL;

-- Tasks
CREATE INDEX idx_tasks_organization ON tasks(organization_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_field ON tasks(field_id);
CREATE INDEX idx_tasks_deleted ON tasks(deleted_at) WHERE deleted_at IS NULL;

-- Calendar Events
CREATE INDEX idx_calendar_events_organization ON calendar_events(organization_id);
CREATE INDEX idx_calendar_events_field ON calendar_events(field_id);
CREATE INDEX idx_calendar_events_crop ON calendar_events(crop_id);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date DESC);
CREATE INDEX idx_calendar_events_deleted ON calendar_events(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- Triggers
-- ============================================

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cultivation_records_updated_at BEFORE UPDATE ON cultivation_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
