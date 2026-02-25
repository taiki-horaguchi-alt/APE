-- APE Row Level Security Policies for New Tables
-- Created: 2026-02-25
-- Description: RLS policies for messages, tasks, calendar_events, proposals, and invoices tables

-- ============================================
-- Enable RLS on new tables
-- ============================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Messages Policies
-- ============================================

CREATE POLICY "Users can view messages in their organization conversations"
  ON messages FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert messages in their organization"
  ON messages FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND sender_id = auth.uid()
  )
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can soft-delete their own messages"
  ON messages FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND sender_id = auth.uid()
  );

-- ============================================
-- Tasks Policies
-- ============================================

CREATE POLICY "Users can view organization tasks"
  ON tasks FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert tasks for their organization"
  ON tasks FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND created_by_id = auth.uid()
  );

CREATE POLICY "Users can update organization tasks"
  ON tasks FOR UPDATE
  USING (organization_id = get_user_organization_id())
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can soft-delete organization tasks"
  ON tasks FOR DELETE
  USING (organization_id = get_user_organization_id());

-- ============================================
-- Calendar Events Policies
-- ============================================

CREATE POLICY "Users can view organization calendar events"
  ON calendar_events FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert calendar events for their organization"
  ON calendar_events FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND created_by_id = auth.uid()
  );

CREATE POLICY "Users can update organization calendar events"
  ON calendar_events FOR UPDATE
  USING (organization_id = get_user_organization_id())
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can soft-delete organization calendar events"
  ON calendar_events FOR DELETE
  USING (organization_id = get_user_organization_id());

-- ============================================
-- Cultivation Records Policies
-- ============================================

CREATE POLICY "Users can view organization cultivation records"
  ON cultivation_records FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert cultivation records for their organization"
  ON cultivation_records FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND created_by_id = auth.uid()
  );

CREATE POLICY "Users can update organization cultivation records"
  ON cultivation_records FOR UPDATE
  USING (organization_id = get_user_organization_id())
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can soft-delete organization cultivation records"
  ON cultivation_records FOR DELETE
  USING (organization_id = get_user_organization_id());

-- ============================================
-- Proposals Policies
-- ============================================

CREATE POLICY "Users can view organization proposals"
  ON proposals FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert proposals for their organization"
  ON proposals FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND created_by_id = auth.uid()
  );

CREATE POLICY "Users can update organization proposals"
  ON proposals FOR UPDATE
  USING (organization_id = get_user_organization_id())
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can soft-delete organization proposals"
  ON proposals FOR DELETE
  USING (organization_id = get_user_organization_id());

-- ============================================
-- Invoices Policies
-- ============================================

CREATE POLICY "Users can view organization invoices"
  ON invoices FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert invoices for their organization"
  ON invoices FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND created_by_id = auth.uid()
  );

CREATE POLICY "Users can update organization invoices"
  ON invoices FOR UPDATE
  USING (organization_id = get_user_organization_id())
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can soft-delete organization invoices"
  ON invoices FOR DELETE
  USING (organization_id = get_user_organization_id());
