-- Foreign workers table
CREATE TABLE foreign_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID,
  name VARCHAR(255) NOT NULL,
  country_code VARCHAR(2),
  native_language VARCHAR(10) NOT NULL DEFAULT 'en',
  date_of_birth DATE,
  passport_number VARCHAR(50),
  visa_type VARCHAR(50),
  visa_expiry_date DATE,
  emergency_contact_1 VARCHAR(255),
  emergency_contact_1_phone VARCHAR(20),
  emergency_contact_2 VARCHAR(255),
  emergency_contact_2_phone VARCHAR(20),
  address_jp VARCHAR(255),
  phone_number VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Work instructions table
CREATE TABLE work_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID,
  title_ja VARCHAR(255) NOT NULL,
  title_vi VARCHAR(255),
  title_id VARCHAR(255),
  title_tl VARCHAR(255),
  title_en VARCHAR(255),
  description_ja TEXT,
  description_vi TEXT,
  description_id TEXT,
  description_tl TEXT,
  description_en TEXT,
  category VARCHAR(50),
  priority INTEGER DEFAULT 1,
  assigned_to_workers UUID[],
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Work instruction steps (for visual instructions with images)
CREATE TABLE work_instruction_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instruction_id UUID REFERENCES work_instructions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title_ja VARCHAR(255),
  title_vi VARCHAR(255),
  title_id VARCHAR(255),
  title_tl VARCHAR(255),
  title_en VARCHAR(255),
  description_ja TEXT,
  description_vi TEXT,
  description_id TEXT,
  description_tl TEXT,
  description_en TEXT,
  image_url VARCHAR(500),
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily reports table
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES foreign_workers(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  weather_condition VARCHAR(50),
  temperature_celsius DECIMAL(5, 2),
  humidity_percent INTEGER,
  hours_worked DECIMAL(5, 2),
  tasks_completed TEXT[],
  notes_ja TEXT,
  notes_vi TEXT,
  notes_id TEXT,
  notes_tl TEXT,
  notes_en TEXT,
  photo_1_url VARCHAR(500),
  photo_2_url VARCHAR(500),
  photo_3_url VARCHAR(500),
  voice_memo_url VARCHAR(500),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pesticides and materials database (multilingual)
CREATE TABLE pesticide_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code VARCHAR(100) UNIQUE,
  product_code VARCHAR(100) UNIQUE,
  name_ja VARCHAR(255) NOT NULL,
  name_vi VARCHAR(255),
  name_id VARCHAR(255),
  name_tl VARCHAR(255),
  name_en VARCHAR(255),
  category VARCHAR(50),
  manufacturer VARCHAR(255),
  active_ingredient VARCHAR(255),
  safety_data_sheet_url VARCHAR(500),
  usage_ja TEXT,
  usage_vi TEXT,
  usage_id TEXT,
  usage_tl TEXT,
  usage_en TEXT,
  safety_precautions_ja TEXT,
  safety_precautions_vi TEXT,
  safety_precautions_id TEXT,
  safety_precautions_tl TEXT,
  safety_precautions_en TEXT,
  max_application_count INTEGER,
  application_interval_days INTEGER,
  re_entry_period_hours INTEGER,
  harvest_waiting_period_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Emergency contacts table
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID,
  name_ja VARCHAR(255) NOT NULL,
  name_vi VARCHAR(255),
  name_id VARCHAR(255),
  name_tl VARCHAR(255),
  name_en VARCHAR(255),
  phone_number VARCHAR(20) NOT NULL,
  type VARCHAR(50),
  is_available_24h BOOLEAN DEFAULT FALSE,
  language_support VARCHAR(10)[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Offline sync queue
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID,
  table_name VARCHAR(100) NOT NULL,
  operation VARCHAR(10) NOT NULL,
  record_id UUID,
  data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  synced BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_foreign_workers_user_id ON foreign_workers(user_id);
CREATE INDEX idx_foreign_workers_farm_id ON foreign_workers(farm_id);
CREATE INDEX idx_work_instructions_farm_id ON work_instructions(farm_id);
CREATE INDEX idx_work_instructions_status ON work_instructions(status);
CREATE INDEX idx_daily_reports_worker_id ON daily_reports(worker_id);
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX idx_pesticide_materials_qr ON pesticide_materials(qr_code);
CREATE INDEX idx_emergency_contacts_farm_id ON emergency_contacts(farm_id);
CREATE INDEX idx_sync_queue_worker_id ON sync_queue(worker_id);
CREATE INDEX idx_sync_queue_synced ON sync_queue(synced);
