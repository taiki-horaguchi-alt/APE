-- APE Proposals and Invoices Tables
-- Created: 2026-02-23
-- Description: Add proposals and invoices tables for business operations

-- ============================================
-- 1. Proposals (提案書)
-- ============================================
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  -- Status: draft, sent, accepted, rejected
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),

  -- Proposal details
  crops TEXT[], -- Array of crop names
  total_volume TEXT,
  total_amount DECIMAL(12, 2),

  -- Template info
  template_type TEXT, -- seasonal, annual, organic, volume, custom

  -- Metadata
  valid_until DATE,
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
-- 2. Invoices (請求書・納品書)
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,

  -- Invoice type: invoice (請求書) or delivery_note (納品書)
  type TEXT NOT NULL CHECK (type IN ('invoice', 'delivery_note')),

  -- Invoice info
  number TEXT NOT NULL UNIQUE,
  issue_date DATE NOT NULL,
  due_date DATE,

  -- Status: draft, sent, paid, overdue
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),

  -- Items (stored as JSONB for flexibility)
  items JSONB, -- Array of {name, quantity, unit, unitPrice, amount}

  -- Amounts
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) DEFAULT 0,

  -- Notes
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

-- Proposals
CREATE INDEX idx_proposals_organization ON proposals(organization_id);
CREATE INDEX idx_proposals_buyer ON proposals(buyer_id);
CREATE INDEX idx_proposals_created_by ON proposals(created_by_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created ON proposals(created_at DESC);
CREATE INDEX idx_proposals_deleted ON proposals(deleted_at) WHERE deleted_at IS NULL;

-- Invoices
CREATE INDEX idx_invoices_organization ON invoices(organization_id);
CREATE INDEX idx_invoices_buyer ON invoices(buyer_id);
CREATE INDEX idx_invoices_created_by ON invoices(created_by_id);
CREATE INDEX idx_invoices_type ON invoices(type);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(number);
CREATE INDEX idx_invoices_created ON invoices(created_at DESC);
CREATE INDEX idx_invoices_deleted ON invoices(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- Triggers
-- ============================================

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
