/**
 * APE Database Types
 * Auto-generated types based on Supabase schema
 * Run `pnpm generate-types` to regenerate from live database
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================
// Enums
// ============================================

export type LaborType = 'solo' | 'partner' | 'family_employees'
export type WorkHours = 'full_time' | 'part_time'
export type UserRole = 'owner' | 'manager' | 'member'
export type BuyerType = 'restaurant' | 'hotel' | 'chain_hq' | 'direct_sales' | 'ja' | 'market' | 'supermarket'
export type PriceLevel = 'low' | 'medium' | 'medium_high' | 'high'
export type SoilSource = 'satellite' | 'iot' | 'manual'
export type Season = 'summer' | 'winter'
export type FrostTolerance = 'low' | 'medium' | 'high' | 'very_high'
export type WaterRequirement = 'low' | 'medium' | 'high'
export type RecordType = 'planting' | 'fertilizer' | 'pesticide' | 'harvest' | 'other'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskCategory = 'cultivation' | 'harvest' | 'shipping' | 'maintenance' | 'admin' | 'other'
export type EventType = 'planting' | 'pesticide' | 'fertilizer' | 'harvest' | 'shipping' | 'maintenance' | 'other'
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected'
export type InvoiceType = 'invoice' | 'delivery_note'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'
export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE'
export type SyncStatus = 'pending' | 'synced' | 'conflict' | 'failed'
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE'

// ============================================
// Database Tables
// ============================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string | null
          farm_name: string
          avatar_url: string | null
          labor_type: LaborType | null
          work_hours: WorkHours | null
          interested_crops: string[]
          role: UserRole
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          farm_name: string
          avatar_url?: string | null
          labor_type?: LaborType | null
          work_hours?: WorkHours | null
          interested_crops?: string[]
          role?: UserRole
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          farm_name?: string
          avatar_url?: string | null
          labor_type?: LaborType | null
          work_hours?: WorkHours | null
          interested_crops?: string[]
          role?: UserRole
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          organization_id: string
          name: string
          prefecture: string
          city: string
          area: string | null
          latitude: number
          longitude: number
          elevation: number | null
          climate_zone: string | null
          annual_temp: number | null
          annual_rainfall: number | null
          snow_days: number | null
          frost_free_days: number | null
          soil_type: string | null
          main_crops: string[]
          challenges: string[]
          description: string | null
          version: number
          local_id: string | null
          last_modified_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          prefecture: string
          city: string
          area?: string | null
          latitude: number
          longitude: number
          elevation?: number | null
          climate_zone?: string | null
          annual_temp?: number | null
          annual_rainfall?: number | null
          snow_days?: number | null
          frost_free_days?: number | null
          soil_type?: string | null
          main_crops?: string[]
          challenges?: string[]
          description?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          prefecture?: string
          city?: string
          area?: string | null
          latitude?: number
          longitude?: number
          elevation?: number | null
          climate_zone?: string | null
          annual_temp?: number | null
          annual_rainfall?: number | null
          snow_days?: number | null
          frost_free_days?: number | null
          soil_type?: string | null
          main_crops?: string[]
          challenges?: string[]
          description?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      fields: {
        Row: {
          id: string
          organization_id: string
          location_id: string | null
          soil_profile_id: string | null
          name: string
          polygon: Json | null
          area_size: number | null
          version: number
          local_id: string | null
          last_modified_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          location_id?: string | null
          soil_profile_id?: string | null
          name: string
          polygon?: Json | null
          area_size?: number | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          location_id?: string | null
          soil_profile_id?: string | null
          name?: string
          polygon?: Json | null
          area_size?: number | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      soil_profiles: {
        Row: {
          id: string
          organization_id: string
          location_id: string | null
          name: string
          soil_type: string | null
          metrics: Json
          overall_score: number | null
          strengths: string[]
          weaknesses: string[]
          recommendation: string | null
          source: SoilSource
          version: number
          local_id: string | null
          last_modified_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          location_id?: string | null
          name: string
          soil_type?: string | null
          metrics?: Json
          overall_score?: number | null
          strengths?: string[]
          weaknesses?: string[]
          recommendation?: string | null
          source?: SoilSource
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          location_id?: string | null
          name?: string
          soil_type?: string | null
          metrics?: Json
          overall_score?: number | null
          strengths?: string[]
          weaknesses?: string[]
          recommendation?: string | null
          source?: SoilSource
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      crops: {
        Row: {
          id: string
          name: string
          name_en: string | null
          season: Season | null
          category: string | null
          planting_months: number[]
          harvest_months: number[]
          optimal_temp_min: number | null
          optimal_temp_max: number | null
          frost_tolerance: FrostTolerance | null
          revenue_per_unit: number | null
          cost_per_unit: number | null
          difficulty: number | null
          water_requirement: WaterRequirement | null
          suitable_soil_ph_min: number | null
          suitable_soil_ph_max: number | null
          rotation_avoid: string[]
          description: string | null
          icon_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          name_en?: string | null
          season?: Season | null
          category?: string | null
          planting_months?: number[]
          harvest_months?: number[]
          optimal_temp_min?: number | null
          optimal_temp_max?: number | null
          frost_tolerance?: FrostTolerance | null
          revenue_per_unit?: number | null
          cost_per_unit?: number | null
          difficulty?: number | null
          water_requirement?: WaterRequirement | null
          suitable_soil_ph_min?: number | null
          suitable_soil_ph_max?: number | null
          rotation_avoid?: string[]
          description?: string | null
          icon_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          season?: Season | null
          category?: string | null
          planting_months?: number[]
          harvest_months?: number[]
          optimal_temp_min?: number | null
          optimal_temp_max?: number | null
          frost_tolerance?: FrostTolerance | null
          revenue_per_unit?: number | null
          cost_per_unit?: number | null
          difficulty?: number | null
          water_requirement?: WaterRequirement | null
          suitable_soil_ph_min?: number | null
          suitable_soil_ph_max?: number | null
          rotation_avoid?: string[]
          description?: string | null
          icon_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      buyers: {
        Row: {
          id: string
          organization_id: string
          name: string
          type: BuyerType | null
          latitude: number | null
          longitude: number | null
          distance: string | null
          demand_crops: string[]
          price_level: PriceLevel | null
          contact: string | null
          match_score: number | null
          monthly_volume: number | null
          description: string | null
          version: number
          local_id: string | null
          last_modified_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          type?: BuyerType | null
          latitude?: number | null
          longitude?: number | null
          distance?: string | null
          demand_crops?: string[]
          price_level?: PriceLevel | null
          contact?: string | null
          match_score?: number | null
          monthly_volume?: number | null
          description?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          type?: BuyerType | null
          latitude?: number | null
          longitude?: number | null
          distance?: string | null
          demand_crops?: string[]
          price_level?: PriceLevel | null
          contact?: string | null
          match_score?: number | null
          monthly_volume?: number | null
          description?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      simulations: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          name: string | null
          summer_crop_id: string | null
          winter_crop_id: string | null
          field_id: string | null
          area_size: number | null
          risk_scenarios: Json
          result: Json | null
          notes: string | null
          version: number
          local_id: string | null
          last_modified_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          name?: string | null
          summer_crop_id?: string | null
          winter_crop_id?: string | null
          field_id?: string | null
          area_size?: number | null
          risk_scenarios?: Json
          result?: Json | null
          notes?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          name?: string | null
          summer_crop_id?: string | null
          winter_crop_id?: string | null
          field_id?: string | null
          area_size?: number | null
          risk_scenarios?: Json
          result?: Json | null
          notes?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      markets: {
        Row: {
          id: string
          name: string
          location: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          created_at?: string
        }
      }
      market_prices: {
        Row: {
          id: string
          market_id: string
          crop_id: string
          price_date: string
          price: number
          unit: string
          created_at: string
        }
        Insert: {
          id?: string
          market_id: string
          crop_id: string
          price_date: string
          price: number
          unit?: string
          created_at?: string
        }
        Update: {
          id?: string
          market_id?: string
          crop_id?: string
          price_date?: string
          price?: number
          unit?: string
          created_at?: string
        }
      }
      sync_queue: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string
          device_id: string
          operation: SyncOperation
          table_name: string
          record_id: string
          data: Json | null
          status: SyncStatus
          error_message: string | null
          retry_count: number
          created_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id: string
          device_id: string
          operation: SyncOperation
          table_name: string
          record_id: string
          data?: Json | null
          status?: SyncStatus
          error_message?: string | null
          retry_count?: number
          created_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string
          device_id?: string
          operation?: SyncOperation
          table_name?: string
          record_id?: string
          data?: Json | null
          status?: SyncStatus
          error_message?: string | null
          retry_count?: number
          created_at?: string
          synced_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          buyer_id: string
          organization_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          organization_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          organization_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          table_name: string
          record_id: string
          action: AuditAction
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          table_name: string
          record_id: string
          action: AuditAction
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          table_name?: string
          record_id?: string
          action?: AuditAction
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      cultivation_records: {
        Row: {
          id: string
          organization_id: string
          field_id: string | null
          crop_id: string | null
          type: 'planting' | 'fertilizer' | 'pesticide' | 'harvest' | 'other'
          record_date: string
          title: string
          description: string | null
          pesticide_name: string | null
          pesticide_usage_count: number | null
          fertilizer_name: string | null
          fertilizer_quantity: number | null
          harvest_quantity: number | null
          harvest_unit: string | null
          photo_url: string | null
          voice_memo_url: string | null
          version: number
          local_id: string | null
          last_modified_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          field_id?: string | null
          crop_id?: string | null
          type: 'planting' | 'fertilizer' | 'pesticide' | 'harvest' | 'other'
          record_date: string
          title: string
          description?: string | null
          pesticide_name?: string | null
          pesticide_usage_count?: number | null
          fertilizer_name?: string | null
          fertilizer_quantity?: number | null
          harvest_quantity?: number | null
          harvest_unit?: string | null
          photo_url?: string | null
          voice_memo_url?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          field_id?: string | null
          crop_id?: string | null
          type?: 'planting' | 'fertilizer' | 'pesticide' | 'harvest' | 'other'
          record_date?: string
          title?: string
          description?: string | null
          pesticide_name?: string | null
          pesticide_usage_count?: number | null
          fertilizer_name?: string | null
          fertilizer_quantity?: number | null
          harvest_quantity?: number | null
          harvest_unit?: string | null
          photo_url?: string | null
          voice_memo_url?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          organization_id: string
          created_by_id: string
          field_id: string | null
          crop_id: string | null
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          category: 'cultivation' | 'harvest' | 'shipping' | 'maintenance' | 'admin' | 'other'
          due_date: string | null
          is_recurring: boolean
          recurring_pattern: string | null
          assigned_to: string | null
          version: number
          local_id: string | null
          last_modified_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          created_by_id: string
          field_id?: string | null
          crop_id?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          category?: 'cultivation' | 'harvest' | 'shipping' | 'maintenance' | 'admin' | 'other'
          due_date?: string | null
          is_recurring?: boolean
          recurring_pattern?: string | null
          assigned_to?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          created_by_id?: string
          field_id?: string | null
          crop_id?: string | null
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          category?: 'cultivation' | 'harvest' | 'shipping' | 'maintenance' | 'admin' | 'other'
          due_date?: string | null
          is_recurring?: boolean
          recurring_pattern?: string | null
          assigned_to?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      calendar_events: {
        Row: {
          id: string
          organization_id: string
          created_by_id: string
          field_id: string | null
          crop_id: string | null
          title: string
          description: string | null
          type: 'planting' | 'pesticide' | 'fertilizer' | 'harvest' | 'shipping' | 'maintenance' | 'other'
          event_date: string
          start_time: string | null
          end_time: string | null
          location: string | null
          cultivation_record_id: string | null
          task_id: string | null
          notes: string | null
          version: number
          local_id: string | null
          last_modified_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          created_by_id: string
          field_id?: string | null
          crop_id?: string | null
          title: string
          description?: string | null
          type: 'planting' | 'pesticide' | 'fertilizer' | 'harvest' | 'shipping' | 'maintenance' | 'other'
          event_date: string
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          cultivation_record_id?: string | null
          task_id?: string | null
          notes?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          created_by_id?: string
          field_id?: string | null
          crop_id?: string | null
          title?: string
          description?: string | null
          type?: 'planting' | 'pesticide' | 'fertilizer' | 'harvest' | 'shipping' | 'maintenance' | 'other'
          event_date?: string
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          cultivation_record_id?: string | null
          task_id?: string | null
          notes?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      proposals: {
        Row: {
          id: string
          organization_id: string
          created_by_id: string
          buyer_id: string
          title: string
          description: string | null
          status: 'draft' | 'sent' | 'accepted' | 'rejected'
          crops: string[] | null
          total_volume: string | null
          total_amount: number | null
          template_type: string | null
          valid_until: string | null
          notes: string | null
          version: number
          local_id: string | null
          last_modified_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          created_by_id: string
          buyer_id: string
          title: string
          description?: string | null
          status?: 'draft' | 'sent' | 'accepted' | 'rejected'
          crops?: string[] | null
          total_volume?: string | null
          total_amount?: number | null
          template_type?: string | null
          valid_until?: string | null
          notes?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          created_by_id?: string
          buyer_id?: string
          title?: string
          description?: string | null
          status?: 'draft' | 'sent' | 'accepted' | 'rejected'
          crops?: string[] | null
          total_volume?: string | null
          total_amount?: number | null
          template_type?: string | null
          valid_until?: string | null
          notes?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      invoices: {
        Row: {
          id: string
          organization_id: string
          created_by_id: string
          buyer_id: string
          type: 'invoice' | 'delivery_note'
          number: string
          issue_date: string
          due_date: string | null
          status: 'draft' | 'sent' | 'paid' | 'overdue'
          items: Json | null
          subtotal: number
          tax: number
          total: number
          notes: string | null
          version: number
          local_id: string | null
          last_modified_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          created_by_id: string
          buyer_id: string
          type: 'invoice' | 'delivery_note'
          number: string
          issue_date: string
          due_date?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          items?: Json | null
          subtotal?: number
          tax?: number
          total?: number
          notes?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          created_by_id?: string
          buyer_id?: string
          type?: 'invoice' | 'delivery_note'
          number?: string
          issue_date?: string
          due_date?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          items?: Json | null
          subtotal?: number
          tax?: number
          total?: number
          notes?: string | null
          version?: number
          local_id?: string | null
          last_modified_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
    Functions: {
      get_user_organization_id: {
        Args: Record<string, never>
        Returns: string
      }
      is_organization_owner: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_manager_or_owner: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}

// ============================================
// Helper Types
// ============================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Organization = Tables<'organizations'>
export type User = Tables<'users'>
export type Location = Tables<'locations'>
export type Field = Tables<'fields'>
export type SoilProfile = Tables<'soil_profiles'>
export type Crop = Tables<'crops'>
export type Buyer = Tables<'buyers'>
export type Simulation = Tables<'simulations'>
export type Market = Tables<'markets'>
export type MarketPrice = Tables<'market_prices'>
export type Message = Tables<'messages'>
export type CultivationRecord = Tables<'cultivation_records'>
export type Task = Tables<'tasks'>
export type CalendarEvent = Tables<'calendar_events'>
export type Proposal = Tables<'proposals'>
export type Invoice = Tables<'invoices'>
export type SyncQueueItem = Tables<'sync_queue'>
export type AuditLogEntry = Tables<'audit_log'>
