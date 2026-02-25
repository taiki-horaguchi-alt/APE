/**
 * APE Database Package
 * Shared Supabase client and typed queries for web and mobile apps
 */

// Client
export { createClient, createClientWithOptions, supabase, getTable } from './client'
export type { SupabaseClient } from './client'

// Types
export * from './types'

// Queries
export * from './queries/crops'
export * from './queries/fields'
export * from './queries/simulations'
export * from './queries/market-prices'
