-- APE Row Level Security Policies
-- Created: 2026-02-04
-- Description: Organization-based access control for multi-tenant data

-- ============================================
-- Enable RLS on all user data tables
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Organizations table - special handling
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Master data tables (read-only for all authenticated users)
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper Function: Get user's organization_id
-- ============================================
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- Helper Function: Check if user is organization owner
-- ============================================
CREATE OR REPLACE FUNCTION is_organization_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'owner'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- Helper Function: Check if user is manager or owner
-- ============================================
CREATE OR REPLACE FUNCTION is_manager_or_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('owner', 'manager')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- Organizations Policies
-- ============================================

-- Users can view their own organization
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id = get_user_organization_id());

-- Only owners can update organization
CREATE POLICY "Owners can update organization"
  ON organizations FOR UPDATE
  USING (id = get_user_organization_id() AND is_organization_owner())
  WITH CHECK (id = get_user_organization_id() AND is_organization_owner());

-- Anyone can create an organization (for new signups)
CREATE POLICY "Anyone can create organization"
  ON organizations FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- Users Policies
-- ============================================

-- Users can view members of their organization
CREATE POLICY "Users can view organization members"
  ON users FOR SELECT
  USING (organization_id = get_user_organization_id() OR id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- New users can insert their profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- Only owners can delete members
CREATE POLICY "Owners can delete members"
  ON users FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND is_organization_owner()
    AND id != auth.uid() -- Cannot delete self
  );

-- ============================================
-- Locations Policies
-- ============================================

-- Users can view their organization's locations
CREATE POLICY "Users can view organization locations"
  ON locations FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Users can insert locations for their organization
CREATE POLICY "Users can insert locations"
  ON locations FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- Users can update their organization's locations
CREATE POLICY "Users can update locations"
  ON locations FOR UPDATE
  USING (organization_id = get_user_organization_id())
  WITH CHECK (organization_id = get_user_organization_id());

-- Managers/Owners can delete locations
CREATE POLICY "Managers can delete locations"
  ON locations FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_manager_or_owner());

-- ============================================
-- Soil Profiles Policies
-- ============================================

CREATE POLICY "Users can view organization soil profiles"
  ON soil_profiles FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert soil profiles"
  ON soil_profiles FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update soil profiles"
  ON soil_profiles FOR UPDATE
  USING (organization_id = get_user_organization_id())
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Managers can delete soil profiles"
  ON soil_profiles FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_manager_or_owner());

-- ============================================
-- Fields Policies
-- ============================================

CREATE POLICY "Users can view organization fields"
  ON fields FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert fields"
  ON fields FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update fields"
  ON fields FOR UPDATE
  USING (organization_id = get_user_organization_id())
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Managers can delete fields"
  ON fields FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_manager_or_owner());

-- ============================================
-- Buyers Policies
-- ============================================

CREATE POLICY "Users can view organization buyers"
  ON buyers FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert buyers"
  ON buyers FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update buyers"
  ON buyers FOR UPDATE
  USING (organization_id = get_user_organization_id())
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Managers can delete buyers"
  ON buyers FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_manager_or_owner());

-- ============================================
-- Simulations Policies
-- ============================================

CREATE POLICY "Users can view organization simulations"
  ON simulations FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert simulations"
  ON simulations FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND user_id = auth.uid()
  );

-- Users can update their own simulations, managers can update any
CREATE POLICY "Users can update simulations"
  ON simulations FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND (user_id = auth.uid() OR is_manager_or_owner())
  )
  WITH CHECK (organization_id = get_user_organization_id());

-- Users can delete their own simulations, managers can delete any
CREATE POLICY "Users can delete simulations"
  ON simulations FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND (user_id = auth.uid() OR is_manager_or_owner())
  );

-- ============================================
-- Sync Queue Policies
-- ============================================

-- Users can only see their own sync operations
CREATE POLICY "Users can view own sync queue"
  ON sync_queue FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert sync operations"
  ON sync_queue FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sync operations"
  ON sync_queue FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own sync operations"
  ON sync_queue FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- Audit Log Policies (Read-only for users)
-- ============================================

-- Managers can view audit logs for their organization
CREATE POLICY "Managers can view audit logs"
  ON audit_log FOR SELECT
  USING (organization_id = get_user_organization_id() AND is_manager_or_owner());

-- System inserts only (no user INSERT policy)

-- ============================================
-- Crops Policies (Read-only master data)
-- ============================================

CREATE POLICY "Anyone authenticated can view crops"
  ON crops FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- Markets Policies (Read-only master data)
-- ============================================

CREATE POLICY "Anyone authenticated can view markets"
  ON markets FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- Market Prices Policies (Read-only master data)
-- ============================================

CREATE POLICY "Anyone authenticated can view market prices"
  ON market_prices FOR SELECT
  USING (auth.role() = 'authenticated');
